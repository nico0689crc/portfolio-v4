// Next Imports
import Link from 'next/link'

// Third-party Imports
import { AlertTriangle, CheckCircle2, Clock, Plug, Send } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import CoverThumb from '@/components/admin/views/linkedin/CoverThumb'
import PublishedShares, { type PublishedShare } from '@/components/admin/views/linkedin/PublishedShares'
import ShareActions from '@/components/admin/views/linkedin/ShareActions'
import UnscheduledPosts from '@/components/admin/views/linkedin/UnscheduledPosts'

// Lib Imports
import { formatPanelDate } from '@/lib/admin/dates'
import { listCandidates } from '@/lib/admin/linkedin-candidates'
import { BUCKETS, storageUrl } from '@/lib/content/storage'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  AGENDA_OFFSET_HOURS,
  SHARE_LOCALE,
  buildMessage,
  linkedInPostUrl,
  nextSlot,
  shareLabel,
  type ShareAsset,
  type ShareStatus
} from '@/lib/social/shares'

export const metadata = { title: 'LinkedIn' }

/** Los estados que ocupan un lugar en la agenda; el resto es historial. */
const ACTIVE: ShareStatus[] = ['scheduled', 'sending', 'queued']

/**
 * `datetime-local` quiere `YYYY-MM-DDTHH:mm` sin zona, y la zona que corresponde
 * es la de la agenda, no la del server.
 *
 * Los getters locales —`getHours()` y compañía— responden al huso del proceso,
 * que en Vercel es UTC: el turno de las 11 llegaba al input como las 14, y como
 * el formulario lo reinterpretaba con el offset del navegador, se guardaba a las
 * 14. En local no se notaba porque la máquina ya está en hora argentina.
 */
const toAgendaInput = (date: Date) =>
  new Date(date.getTime() + AGENDA_OFFSET_HOURS * 3_600_000).toISOString().slice(0, 16)

const formatSlot = (value: string | Date) =>
  formatPanelDate(value, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

const STATUS_STYLE: Record<string, { className: string; icon: typeof Clock }> = {
  Programado: { className: 'bg-sky-600/10 text-sky-600 dark:text-sky-500', icon: Clock },
  Entregando: { className: 'bg-amber-600/10 text-amber-600 dark:text-amber-500', icon: Send },
  'En Buffer': { className: 'bg-amber-600/10 text-amber-600 dark:text-amber-500', icon: Send },
  Publicado: { className: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-500', icon: CheckCircle2 },
  Falló: { className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
  Cancelado: { className: 'bg-muted text-muted-foreground', icon: AlertTriangle }
}

/** Cuántos días antes de que venza el token empieza a avisar el panel. */
const EXPIRY_WARNING_DAYS = 10

/** Días que faltan para una fecha. Redondea hacia abajo: avisa de más, nunca de menos. */
const daysUntil = (iso: string) => Math.floor((new Date(iso).getTime() - new Date().getTime()) / 86_400_000)

/**
 * La agenda de LinkedIn.
 *
 * Dos listas y nada más: a la izquierda lo que ya tiene turno, a la derecha lo
 * que falta. El botón de cada candidato trae la fecha calculada —última
 * programada + la cadencia—, así llenar la agenda del archivo entero es un
 * clic por nota en vez de elegir fecha cincuenta veces.
 */
const AdminLinkedInPage = async ({
  searchParams
}: {
  searchParams: Promise<{ conectado?: string; error?: string }>
}) => {
  const { conectado, error: authError } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: account } = await supabase
    .from('social_accounts')
    .select('account_name, account_urn, expires_at, scopes')
    .eq('provider', 'linkedin')
    .maybeSingle()

  const expiresInDays = account ? daysUntil(account.expires_at) : null
  // `w_member_social_feed` es un scope aparte del de publicar y "Share on
  // LinkedIn" no lo incluye. Sin él el posteo sale igual, pero el link no se
  // puede dejar como comentario: mejor decirlo acá que descubrirlo en un aviso
  // después de publicar.
  const canComment = account?.scopes.includes('w_member_social_feed') ?? false

  // La agenda y la lista de la derecha son dos consultas independientes: la
  // derecha se pagina contra el server —`listCandidates` es lo mismo que llama
  // el navegador al cambiar de página— así que acá sólo se pide la primera.
  const [{ data: shares, error: sharesError }, firstPage] = await Promise.all([
    supabase
      .from('post_social_shares')
      .select(
        'id, post_id, locale, status, message, scheduled_at, delivered_at, error, external_id, assets, link_in_first_comment, provider'
      )
      .eq('channel', 'linkedin')
      .order('scheduled_at', { ascending: true }),
    listCandidates()
  ])

  if (sharesError) {
    return <p className='text-destructive text-sm'>No se pudo cargar la agenda: {sharesError.message}</p>
  }

  // Sólo las notas que tienen algo agendado. `body` viaja entero porque el texto
  // por defecto arranca con la entrada de la nota, y ese es el motivo de acotar
  // la consulta a la agenda en vez de traer todo lo publicado: el cuerpo es la
  // columna más pesada de la tabla.
  const shareIds = [...new Set((shares ?? []).map(s => s.post_id))]

  const { data: translations, error: postsError } =
    shareIds.length === 0
      ? { data: [], error: null }
      : await supabase
          .from('post_translations')
          .select('post_id, title, excerpt, body, slug, posts!inner(cover_path)')
          .eq('locale', SHARE_LOCALE)
          .eq('status', 'published')
          .in('post_id', shareIds)

  if (postsError) {
    return <p className='text-destructive text-sm'>No se pudo cargar la agenda: {postsError.message}</p>
  }

  const byPost = new Map(translations.map(t => [t.post_id, t]))

  const agenda = (shares ?? []).flatMap(share => {
    const post = byPost.get(share.post_id)

    // Una nota despublicada o borrada deja su envío huérfano; mostrarlo sin
    // título sería ruido, y el cron ya lo marca `failed` si llega su turno.
    if (!post) return []

    const label = shareLabel(share.status, share.scheduled_at, share.provider)
    const assets = share.assets as ShareAsset[] | null
    const document = assets?.find(a => a.kind === 'document')
    const article = assets?.some(a => a.kind === 'article')

    return [{
      ...share,
      title: post.title,
      // `null` es el modo automático —la portada vigente— y `[]` la decisión
      // explícita de no adjuntar nada. Son dos cosas distintas y la UI las
      // muestra distinto.
      media: (document
        ? 'document'
        : article
          ? 'article'
          : assets?.length === 0
            ? 'none'
            : 'auto') as 'auto' | 'article' | 'document' | 'none',
      documentName: document ? decodeURIComponent(document.url.split('/').pop() ?? '') : null,
      coverUrl: post.posts.cover_path ? storageUrl(post.posts.cover_path, BUCKETS.postMedia) : null,
      // El mismo texto que armaría la entrega, para que el placeholder del
      // diálogo prometa exactamente lo que va a salir.
      autoMessage: buildMessage({
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        locale: share.locale,
        slug: post.slug
      }),
      label,
      style: STATUS_STYLE[label]
    }]
  })

  // La agenda es un plan y el historial es un registro: responden preguntas
  // distintas y mezclarlos hace que la más importante —qué falta— quede
  // sepultada bajo lo que ya salió, que además va primero por orden de fecha.
  //
  // Lo cancelado no aparece en ninguna de las dos: se cancela justamente para
  // sacarlo de la vista, y la nota vuelve sola a la columna de la derecha.
  const upcoming = agenda.filter(
    s => s.status === 'scheduled' || s.status === 'sending' || s.status === 'failed'
  )
  const done: PublishedShare[] = agenda
    .filter(s => s.status === 'queued')
    .sort((a, b) => (b.delivered_at ?? '').localeCompare(a.delivered_at ?? ''))
    .map(s => ({
      id: s.id,
      title: s.title,
      deliveredAt: s.delivered_at,
      scheduledAt: s.scheduled_at,
      label: s.label,
      provider: s.provider,
      media: s.media,
      linkInFirstComment: s.link_in_first_comment,
      coverUrl: s.coverUrl,
      // Con `message` vacío el texto no se guarda en ningún lado: se arma al
      // entregar y se pierde. Se reconstruye con la misma regla que usó la
      // entrega —el link en el cuerpo sólo si fue con tarjeta— para que el
      // historial no muestre un texto que nunca salió así.
      text: s.message?.trim() || s.autoMessage,
      textIsCustom: Boolean(s.message?.trim()),
      postUrl: linkedInPostUrl(s.external_id, s.provider),
      // En `queued` la columna `error` guarda el aviso, no un fallo.
      warning: s.error
    }))
  const active = agenda.filter(s => ACTIVE.includes(s.status))
  const scheduledCount = agenda.filter(s => s.status === 'scheduled').length
  const failedCount = agenda.filter(s => s.status === 'failed').length

  // El turno sugerido se apoya en el último ocupado, no en la cantidad: si se
  // canceló uno del medio, el hueco queda libre a propósito y la cadencia sigue
  // corriendo desde el final.
  //
  // «Ocupado» es sólo lo que todavía no salió. Un envío ya publicado no reserva
  // nada, y «Publicar ahora» además le deja como `scheduled_at` el instante en
  // que salió: anclar ahí arrastraba ese día y esa hora —un domingo a las
  // 7:15— a toda la agenda que viniera después.
  const reserved = active.filter(s => s.scheduled_at > new Date().toISOString())
  const lastTaken = reserved.length > 0 ? reserved[reserved.length - 1].scheduled_at : null
  const slot = nextSlot(lastTaken)

  return (
    <div className='flex flex-col gap-6'>
      {conectado && (
        <p className='rounded-lg border border-emerald-600/30 bg-emerald-600/10 p-3 text-sm text-emerald-600 dark:text-emerald-500'>
          Cuenta conectada: {conectado}
        </p>
      )}
      {authError && (
        <p className='border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'>
          No se pudo conectar: {authError}
        </p>
      )}

      <div className='border-border flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4'>
        <div className='min-w-0'>
          <p className='text-sm font-medium'>
            {account ? `Publicando como ${account.account_name ?? account.account_urn}` : 'Sin cuenta conectada'}
          </p>
          <p className='text-muted-foreground text-xs'>
            {account ? (
              <>
                El token vence en {expiresInDays} día{expiresInDays === 1 ? '' : 's'}.
                {!canComment && ' Sin permiso de comentar: el link va en el cuerpo del posteo.'}
              </>
            ) : (
              'Conectá tu cuenta para que el cron pueda publicar.'
            )}
          </p>
        </div>
        <Button
          variant={account ? 'outline' : 'default'}
          render={<Link href='/api/admin/linkedin/connect' prefetch={false} />}
        >
          <Plug className='size-4' /> {account ? 'Reconectar' : 'Conectar LinkedIn'}
        </Button>
      </div>

      {/* LinkedIn no renueva el token solo con una app self-serve, así que el
          único aviso posible es este. Sin él, el primer síntoma sería un envío
          fallado el martes a la mañana. */}
      {expiresInDays !== null && expiresInDays <= EXPIRY_WARNING_DAYS && (
        <p className='rounded-lg border border-amber-600/30 bg-amber-600/10 p-3 text-sm text-amber-600 dark:text-amber-500'>
          <AlertTriangle className='mr-1 inline size-4' />
          {expiresInDays <= 0
            ? 'El token venció. Reconectá o los envíos van a fallar.'
            : `El token vence en ${expiresInDays} días. Reconectá cuando puedas.`}
        </p>
      )}

      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>LinkedIn</h1>
        <p className='text-muted-foreground text-sm'>
          {scheduledCount} programados · {done.length} publicados · {firstPage.actionable} para programar
          {failedCount > 0 && ` · ${failedCount} con error`}
        </p>
      </div>

      <div className='grid gap-8 lg:grid-cols-2 lg:items-start'>
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-medium'>Agenda</h2>

          {upcoming.length === 0 ? (
            <p className='text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
              Nada pendiente. Elegí un artículo de la derecha.
            </p>
          ) : (
            <ul className='divide-border border-border divide-y rounded-lg border'>
              {upcoming.map(share => {
                const Icon = share.style?.icon ?? Clock

                return (
                  <li key={share.id} className='flex items-center gap-3 p-3'>
                    <CoverThumb url={share.coverUrl} />

                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <p className='truncate text-sm font-medium' title={share.title}>
                          {share.title}
                        </p>
                        <Badge className={`shrink-0 ${share.style?.className ?? ''}`}>
                          <Icon className='size-3' /> {share.label}
                        </Badge>
                      </div>

                      <p className='text-muted-foreground text-xs'>
                        {formatSlot(share.scheduled_at)}
                        {share.media === 'document' && ' · carrusel'}
                        {share.media === 'article' && ' · tarjeta'}
                        {share.media === 'none' && ' · sin imagen'}
                      </p>

                      {share.error && <p className='text-destructive text-xs'>{share.error}</p>}
                    </div>

                    <ShareActions
                      shareId={share.id}
                      postId={share.post_id}
                      title={share.title}
                      status={share.status}
                      scheduledAtLocal={toAgendaInput(new Date(share.scheduled_at))}
                      message={share.message ?? ''}
                      autoMessage={share.autoMessage}
                      media={share.media}
                      linkInFirstComment={share.link_in_first_comment}
                      currentDocument={share.documentName}
                      hasCover={share.coverUrl !== null}
                    />
                  </li>
                )
              })}
            </ul>
          )}

          {done.length > 0 && (
            <>
              <h2 className='mt-4 text-sm font-medium'>Ya publicados ({done.length})</h2>
              <PublishedShares shares={done} />
            </>
          )}
        </section>

        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-medium'>
            Para programar ({firstPage.actionable}) — próximo turno {formatSlot(slot)}
          </h2>

          <UnscheduledPosts
            initial={firstPage}
            nextSlotLocal={toAgendaInput(slot)}
            nextSlotLabel={formatSlot(slot)}
          />
        </section>
      </div>
    </div>
  )
}

export default AdminLinkedInPage
