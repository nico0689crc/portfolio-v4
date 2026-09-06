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
 *   único que la API acepta al crear, así que el horario del posteo es el
 *   horario del cron. Corriendo 12:00 UTC a diario, eso son las 9 de la mañana
 *   de Argentina, que es la cadencia acordada.
 * - **Buffer** sí agenda, así que se le entrega con anticipación
 *   (`LOOKAHEAD_HOURS`) pasándole la fecha exacta como `dueAt`.
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
  const [direct, queued] = await Promise.all([
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
  ]);

  const error = direct.error ?? queued.error;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const due = [...(direct.data ?? []), ...(queued.data ?? [])]
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

  return NextResponse.json({ delivered, errors, at: new Date().toISOString() });
}
