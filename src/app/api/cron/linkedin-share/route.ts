import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { deliverShare, getDeliveryConfig } from '@/lib/social/deliver';
import type { Database } from '@/types/database';

/**
 * Cron diario: saca los envíos de la agenda que ya llegó su turno.
 *
 * El calendario lo arma una persona en `/admin/linkedin`; acá no se decide
 * nada, sólo se ejecuta. Por eso el cron no busca "notas publicadas sin
 * compartir" —eso barrería el archivo entero la primera vez que corra— sino
 * filas concretas que alguien agendó.
 *
 * Los dos caminos son distintos en un punto que define el resto:
 *
 * - **LinkedIn directo** publica en el acto. `lifecycleState: PUBLISHED` es lo
 *   único que la API acepta al crear, así que el horario del posteo es el de
 *   la corrida, no el `scheduled_at` de la fila. Por eso el cron corre cada
 *   hora y no una vez por día: la corrida que sigue al turno lo levanta, y el
 *   posteo sale con menos de una hora de atraso sin que el horario del cron
 *   tenga que estar calzado con `SLOT_HOUR`. Con una corrida diaria había que
 *   ponerla justo después del turno, y correr cualquiera de los dos sin el
 *   otro atrasaba cada envío un día entero.
 * - **Buffer** sí agenda, así que se le entrega con anticipación
 *   (`LOOKAHEAD_HOURS`) pasándole la fecha exacta como `dueAt`.
 *
 * Correr cada hora tiene un costo que hay que devolver: `BATCH` deja de ser un
 * tope diario. Una agenda atrasada —el cron caído unos días, turnos cargados
 * en el pasado— se publicaría a razón de uno por hora, que en LinkedIn es
 * spam y no tiene arreglo después. `MIN_GAP_HOURS` es lo que lo evita. Buffer
 * queda afuera de esa guarda porque entregar no es publicar: agenda.
 *
 * Única excepción del proyecto al "la service-role key queda afuera de la
 * app" (ver `src/lib/supabase/server.ts`): este handler no tiene sesión de
 * usuario —lo dispara Vercel Cron, no un editor logueado— así que no hay forma
 * de pasar `is_admin()` con la key anónima. Está gateado por `CRON_SECRET`,
 * igual de confiable que un script. La key no se reexporta: el cliente se arma
 * acá adentro y en ningún otro archivo de la app.
 */

/** Cuánto antes de su turno se le entrega un envío a Buffer, que sí agenda. */
const LOOKAHEAD_HOURS = 48;

/**
 * Cuánto tiene que haber pasado desde el último posteo directo para publicar
 * otro. No es la cadencia —esa la fija la agenda, y es bastante más espaciada—
 * sino el piso que impide que un backlog se vacíe de golpe.
 *
 * Cuenta desde `delivered_at`, así que «Publicar ahora» también corre el
 * reloj: si se publicó a mano a la mañana, el turno agendado de esa tarde
 * espera al día siguiente en vez de duplicar la presencia del día.
 */
const MIN_GAP_HOURS = 20;

/** Cuántos envíos entrega cada corrida. Tope de seguridad, no cadencia: la cadencia es la agenda. */
// `||` y no `??`: con la variable vacía, `Number('')` es 0 y el cron no
// entregaría nada, en silencio y sin error.
const BATCH = Number(process.env.LINKEDIN_SHARE_LIMIT || 1);

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET no está configurado' }, { status: 501 });
  }

  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Única excepción del proyecto al "la service-role key queda afuera de la
  // app": este handler no tiene sesión de usuario, así que no hay forma de
  // pasar `is_admin()` con la key anónima. Lo gatea `CRON_SECRET`.
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );

  const config = await getDeliveryConfig(supabase);

  const now = new Date().toISOString();
  const horizon = new Date(Date.now() + LOOKAHEAD_HOURS * 3600 * 1000).toISOString();

  const columns = 'id, scheduled_at';

  // Dos consultas y no una porque el horizonte depende del proveedor: a Buffer
  // se le adelanta el trabajo, LinkedIn se publica cuando de verdad toca. Un
  // único `lte` con el horizonte largo publicaría en LinkedIn hasta dos días
  // antes de tiempo.
  const [direct, queued, lastDirect] = await Promise.all([
    supabase
      .from('post_social_shares')
      .select(columns)
      .eq('status', 'scheduled')
      .eq('provider', 'linkedin')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(BATCH),
    supabase
      .from('post_social_shares')
      .select(columns)
      .eq('status', 'scheduled')
      .eq('provider', 'buffer')
      .lte('scheduled_at', horizon)
      .order('scheduled_at', { ascending: true })
      .limit(BATCH),
    // El último posteo directo que de verdad salió. `delivered_at` sólo se
    // escribe en el éxito, así que un envío fallido no bloquea el reintento.
    supabase
      .from('post_social_shares')
      .select('delivered_at')
      .eq('provider', 'linkedin')
      .not('delivered_at', 'is', null)
      .order('delivered_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const error = direct.error ?? queued.error ?? lastDirect.error;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Las 23 corridas del día que caen fuera de turno no encuentran nada vencido
  // y no hacen nada; ésta es la que frena a la vigésimo cuarta cuando la agenda
  // viene atrasada y hay varias filas vencidas a la vez.
  const lastAt = lastDirect.data?.delivered_at;
  const throttled =
    !!lastAt && Date.now() - new Date(lastAt).getTime() < MIN_GAP_HOURS * 3600 * 1000;

  const due = [...(throttled ? [] : (direct.data ?? [])), ...(queued.data ?? [])]
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
    .slice(0, BATCH);

  const delivered: string[] = [];
  const errors: Array<{ id: string; message: string }> = [];

  for (const share of due) {
    const result = await deliverShare(supabase, share.id, config);

    if (result.ok) delivered.push(share.id);
    // Un envío que ya no se pudo reservar no es un error: lo tomó otra corrida.
    else if (result.claimed) errors.push({ id: share.id, message: result.error });
  }

  // `throttled` viaja en la respuesta para que una corrida que no entregó nada
  // se distinga de una que no tenía nada que entregar.
  return NextResponse.json({ delivered, errors, throttled, at: new Date().toISOString() });
}
