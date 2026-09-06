// Third-party Imports
import { AlertTriangle, CheckCircle2, Clock, Send } from 'lucide-react'

// Component Imports
import { Badge } from '@/components/admin/ui/badge'
import ShareActions from '@/components/admin/views/linkedin/ShareActions'
import UnscheduledPosts, { type Candidate } from '@/components/admin/views/linkedin/UnscheduledPosts'

// Lib Imports
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  SHARE_LOCALE,
  buildMessage,
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

/**
 * La agenda de LinkedIn.
 *
 * Dos listas y nada más: a la izquierda lo que ya tiene turno, a la derecha lo
 * que falta. El botón de cada candidato trae la fecha calculada —última
 * programada + la cadencia—, así llenar la agenda del archivo entero es un
 * clic por nota en vez de elegir fecha cincuenta veces.
 */
const AdminLinkedInPage = async () => {
  const supabase = await createSupabaseServerClient()

  // Dos consultas y el cruce en JS en vez de un embed de PostgREST: la FK es
  // compuesta (post_id, locale) y el volumen es de decenas de filas, así que el
  // join en memoria sale más barato que pelear con la sintaxis del embed.
  const [{ data: shares, error: sharesError }, { data: translations, error: postsError }] =
    await Promise.all([
      supabase
        .from('post_social_shares')
        .select(
          'id, post_id, locale, status, message, scheduled_at, error, external_id, assets, link_in_first_comment'
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

    const label = shareLabel(share.status, share.scheduled_at)
    const assets = share.assets as ShareAsset[] | null
    const document = assets?.find(a => a.kind === 'document')

    return [{
      ...share,
      title: post.title,
      // `null` es el modo automático —la portada vigente— y `[]` la decisión
      // explícita de no adjuntar nada. Son dos cosas distintas y la UI las
      // muestra distinto.
      media: (document ? 'document' : assets?.length === 0 ? 'none' : 'auto') as
        | 'auto'
        | 'document'
        | 'none',
      documentName: document ? decodeURIComponent(document.url.split('/').pop() ?? '') : null,
      hasCover: post.posts.cover_path !== null,
      autoMessage: buildMessage(
        { title: post.title, excerpt: post.excerpt, locale: share.locale, slug: post.slug },
        share.link_in_first_comment
      ),
      label,
      style: STATUS_STYLE[label]
    }]
  })

  // Lo cancelado no se muestra: se cancela justamente para sacarlo de la vista,
  // y la nota vuelve sola a la columna de la derecha.
  const visible = agenda.filter(s => s.status !== 'canceled')
  const active = agenda.filter(s => ACTIVE.includes(s.status))
  const scheduledCount = agenda.filter(s => s.status === 'scheduled').length
  const failedCount = agenda.filter(s => s.status === 'failed').length

  // El turno sugerido se apoya en el último ocupado, no en la cantidad: si se
  // canceló uno del medio, el hueco queda libre a propósito y la cadencia sigue
  // corriendo desde el final.
  const lastTaken = active.length > 0 ? active[active.length - 1].scheduled_at : null
  const slot = nextSlot(lastTaken)

  // Sólo se ofrece lo que no tiene un envío en curso. Lo ya publicado sí puede
  // volver a la lista: recircular una nota vieja es el caso más valioso.
  const taken = new Set(active.map(s => s.post_id))

  const candidates: Candidate[] = translations
    .filter(t => !taken.has(t.post_id) && t.posts.archived_at === null)
    .sort((a, b) => (a.published_at ?? '').localeCompare(b.published_at ?? ''))
    .map(t => ({
      postId: t.post_id,
      key: t.posts.key,
      title: t.title,
      publishedAt: t.published_at,
      hasCover: t.posts.cover_path !== null,
      // Sin el link: por defecto va al primer comentario, no al cuerpo.
      autoMessage: buildMessage({ title: t.title, excerpt: t.excerpt, locale: SHARE_LOCALE, slug: t.slug })
    }))

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>LinkedIn</h1>
        <p className='text-muted-foreground text-sm'>
          {scheduledCount} programados · {candidates.length} sin turno
          {failedCount > 0 && ` · ${failedCount} con error`}
        </p>
      </div>

      <div className='grid gap-8 lg:grid-cols-2 lg:items-start'>
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-medium'>Agenda</h2>

          {visible.length === 0 ? (
            <p className='text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm'>
              Todavía no programaste ninguno. Elegí uno de la derecha.
            </p>
          ) : (
            <ul className='divide-border border-border divide-y rounded-lg border'>
              {visible.map(share => {
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
