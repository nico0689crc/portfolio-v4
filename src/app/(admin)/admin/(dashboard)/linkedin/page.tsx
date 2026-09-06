// Next Imports
import Link from 'next/link'

// Third-party Imports
import { AlertTriangle, CheckCircle2, Clock, Plug, Send } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import { Button } from '@/components/admin/ui/button'
import PublishedShares, { type PublishedShare } from '@/components/admin/views/linkedin/PublishedShares'
import ShareActions from '@/components/admin/views/linkedin/ShareActions'
import UnscheduledPosts, { type Candidate } from '@/components/admin/views/linkedin/UnscheduledPosts'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
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

/** `datetime-local` quiere `YYYY-MM-DDTHH:mm` en hora local, sin zona. */
const toLocalInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const formatSlot = (value: string | Date) =>
  new Date(value).toLocaleString('es-AR', {
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

  // Dos consultas y el cruce en JS en vez de un embed de PostgREST: la FK es
  // compuesta (post_id, locale) y el volumen es de decenas de filas, así que el
  // join en memoria sale más barato que pelear con la sintaxis del embed.
  const [{ data: shares, error: sharesError }, { data: translations, error: postsError }] =
    await Promise.all([
      supabase
        .from('post_social_shares')
        .select(
          'id, post_id, locale, status, message, scheduled_at, delivered_at, error, external_id, assets, link_in_first_comment, provider'
        )
        .eq('channel', 'linkedin')
        .order('scheduled_at', { ascending: true }),
      supabase
        .from('post_translations')
        .select('post_id, title, excerpt, slug, published_at, posts!inner(key, archived_at, cover_path)')
        .eq('locale', SHARE_LOCALE)
        .eq('status', 'published')
    ])

  if (sharesError || postsError) {
    return (
      <p className='text-destructive text-sm'>
        No se pudo cargar la agenda: {(sharesError ?? postsError)!.message}
      </p>
    )
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
      hasCover: post.posts.cover_path !== null,
      // Con tarjeta el switch no aplica —`deliverShare` lo ignora— así que el
      // preview tiene que ignorarlo también o promete un texto que no sale.
      autoMessage: buildMessage(
        { title: post.title, excerpt: post.excerpt, locale: share.locale, slug: post.slug },
        share.link_in_first_comment && !article
      ),
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
      // Con `message` vacío el texto no se guarda en ningún lado: se arma al
      // entregar y se pierde. Reconstruirlo acá con lo vigente es lo más
      // parecido a lo que salió, y para eso sirve `autoMessage`.
      text: s.message?.trim() || s.autoMessage,
      textIsCustom: Boolean(s.message?.trim()),
      postUrl: linkedInPostUrl(s.external_id, s.provider),
      // En `queued` la columna `error` guarda el aviso, no un fallo.
      warning: s.error
    }))
  const active = agenda.filter(s => ACTIVE.includes(s.status))
  // Lo que todavía tiene turno reservado. Es más angosto que `active` a
  // propósito: un envío ya entregado no ocupa nada, y el índice único de la
  // base tampoco lo cuenta. De ahí sale que una nota publicada pueda volver a
  // programarse, que es el caso de recirculación.
  const pending = agenda.filter(s => s.status === 'scheduled' || s.status === 'sending')

  // La última vez que cada nota salió, para no repetirla sin querer.
  const lastShared = new Map<string, string>()

  for (const share of agenda) {
    if (!share.delivered_at) continue

    const previous = lastShared.get(share.post_id)

    if (!previous || share.delivered_at > previous) lastShared.set(share.post_id, share.delivered_at)
  }
  const scheduledCount = agenda.filter(s => s.status === 'scheduled').length
  const failedCount = agenda.filter(s => s.status === 'failed').length

  // El turno sugerido se apoya en el último ocupado, no en la cantidad: si se
  // canceló uno del medio, el hueco queda libre a propósito y la cadencia sigue
  // corriendo desde el final.
  const lastTaken = active.length > 0 ? active[active.length - 1].scheduled_at : null
  const slot = nextSlot(lastTaken)

  // Sólo se ofrece lo que no tiene un envío en curso. Lo ya publicado sí puede
  // volver a la lista: recircular una nota vieja es el caso más valioso.
  const taken = new Set(pending.map(s => s.post_id))

  const candidates: Candidate[] = translations
    .filter(t => !taken.has(t.post_id) && t.posts.archived_at === null)
    .sort((a, b) => (a.published_at ?? '').localeCompare(b.published_at ?? ''))
    .map(t => ({
      postId: t.post_id,
      key: t.posts.key,
      title: t.title,
      publishedAt: t.published_at,
      lastSharedAt: lastShared.get(t.post_id) ?? null,
      hasCover: t.posts.cover_path !== null,
      // Con el link: el default es la tarjeta de enlace, y ahí va en el cuerpo.
      autoMessage: buildMessage({ title: t.title, excerpt: t.excerpt, locale: SHARE_LOCALE, slug: t.slug })
    }))

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
          {scheduledCount} programados · {done.length} publicados · {candidates.length} sin turno
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
                  <li key={share.id} className='flex flex-col gap-2 p-3'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium' title={share.title}>
                          {share.title}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {formatSlot(share.scheduled_at)}
                          {share.media === 'document' && ' · carrusel'}
                          {share.media === 'article' && ' · tarjeta'}
                          {share.media === 'none' && ' · sin imagen'}
                        </p>
                      </div>

                      <Badge className={share.style?.className}>
                        <Icon className='size-3' /> {share.label}
                      </Badge>
                    </div>

                    {share.error && <p className='text-destructive text-xs'>{share.error}</p>}

                    <div className='flex justify-end'>
                      <ShareActions
                        shareId={share.id}
                        postId={share.post_id}
                        title={share.title}
                        status={share.status}
                        scheduledAtLocal={toLocalInput(new Date(share.scheduled_at))}
                        message={share.message ?? ''}
                        autoMessage={share.autoMessage}
                        media={share.media}
                        linkInFirstComment={share.link_in_first_comment}
                        currentDocument={share.documentName}
                        hasCover={share.hasCover}
                      />
                    </div>
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
            Sin programar ({candidates.length}) — próximo turno {formatSlot(slot)}
          </h2>

          <UnscheduledPosts
            candidates={candidates}
            nextSlotLocal={toLocalInput(slot)}
            nextSlotLabel={formatSlot(slot)}
          />
        </section>
      </div>
    </div>
  )
}

export default AdminLinkedInPage
