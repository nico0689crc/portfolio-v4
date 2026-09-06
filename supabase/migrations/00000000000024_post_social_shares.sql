-- Programación de posteos en redes, como módulo propio.
--
-- Reemplaza a las tres columnas `linkedin_*` que la 23 había puesto en
-- `post_translations`. La razón del cambio es que aquello modelaba mal el
-- problema: una nota puede salir a más de una red, y —sobre todo— la misma
-- nota se vuelve a compartir meses después, que en un blog es justamente lo
-- que más rinde. Eso es una relación uno-a-muchos, y en columnas no entra.
--
-- El artículo no sabe nada de esto: `post_translations` vuelve a ser sólo
-- contenido, y la agenda de difusión vive acá con su propia clave. La única
-- referencia va en esta dirección.

alter table public.post_translations
  drop column if exists linkedin_message,
  drop column if exists linkedin_shared_at,
  drop column if exists linkedin_buffer_post_id;

create type public.social_channel as enum ('linkedin');

-- El ciclo de vida completo de un envío. `sending` existe para no duplicar:
-- la fila se reserva ANTES de llamar a Buffer, así que un proceso que muera
-- en el medio deja una fila visible en `sending` en vez de una que el próximo
-- cron vuelve a mandar.
create type public.social_share_status as enum (
  'scheduled',  -- en la agenda, esperando su fecha
  'sending',    -- reservado, entrega a Buffer en curso
  'queued',     -- Buffer lo aceptó y lo tiene agendado (external_id presente)
  'failed',     -- Buffer rechazó la entrega; `error` dice por qué
  'canceled'    -- dado de baja a mano desde el panel
);

create table public.post_social_shares (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null,
  locale       text not null,
  channel      public.social_channel not null default 'linkedin',
  status       public.social_share_status not null default 'scheduled',
  -- Null = se arma solo (título + bajada + link con UTMs) recién al entregar,
  -- así toma el título vigente y no una copia que quedó vieja en la agenda.
  message      text,
  scheduled_at timestamptz not null,
  delivered_at timestamptz,
  external_id  text,
  error        text,
  attempts     int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Compuesta contra la traducción, no contra `posts`: se comparte una
  -- versión concreta en un idioma concreto, con su slug y su título.
  foreign key (post_id, locale)
    references public.post_translations (post_id, locale) on delete cascade
);

create trigger post_social_shares_updated_at before update on public.post_social_shares
  for each row execute function public.set_updated_at();

-- La consulta del cron: lo que ya venció, más viejo primero.
create index post_social_shares_due_idx
  on public.post_social_shares (scheduled_at)
  where status = 'scheduled';

-- Un solo envío pendiente por nota y canal. No alcanza con un unique común:
-- tiene que dejar volver a programar la misma nota cuando la vuelta anterior
-- ya salió, que es el caso de recirculación.
create unique index post_social_shares_pending_idx
  on public.post_social_shares (post_id, locale, channel)
  where status in ('scheduled', 'sending');

alter table public.post_social_shares enable row level security;

-- Mismo criterio que el resto del contenido: el panel escribe con la sesión
-- del admin, y el cron corre con la service-role key, que no pasa por RLS.
-- Sin policy de lectura pública: la agenda de difusión no es contenido.
create policy post_social_shares_admin_all on public.post_social_shares
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

comment on table public.post_social_shares is
  'Agenda de difusión en redes. Una fila por envío: la misma nota puede tener varios a lo largo del tiempo.';
comment on column public.post_social_shares.message is
  'Texto del posteo. Null = se genera al entregar desde título + bajada + link.';
comment on column public.post_social_shares.scheduled_at is
  'Cuándo tiene que salir. El cron lo entrega a Buffer con esta fecha como dueAt.';
comment on column public.post_social_shares.delivered_at is
  'Cuándo Buffer aceptó la entrega. No es cuándo se publicó: eso ocurre en scheduled_at.';
