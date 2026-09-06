-- Publicación directa a LinkedIn, con Buffer como alternativa.
--
-- Buffer dejó de alcanzar: el primer comentario y los documentos son función
-- paga, y las dos cosas vienen incluidas en la API de LinkedIn con el scope
-- `w_member_social`, que es self-serve. Pero Buffer no se tira: la API de
-- LinkedIn obliga a renovar el token a mano cada 60 días, y el día que eso
-- moleste hay que poder volver sin reescribir nada.
--
-- De ahí que `provider` sea una columna y no una env var: cada envío recuerda
-- por dónde salió, y `external_id` se puede interpretar (id de Buffer vs. URN
-- de LinkedIn) sin adivinar.

create type public.social_provider as enum ('linkedin', 'buffer');

alter table public.post_social_shares
  add column provider public.social_provider not null default 'linkedin';

comment on column public.post_social_shares.provider is
  'Por dónde se entrega. Define también cómo leer external_id: id de Buffer o URN de LinkedIn.';

/*
 * El token de la cuenta conectada.
 *
 * Tabla propia y no una fila de `settings` porque acá hay credenciales: la
 * policy es admin-only y no existe ninguna de lectura pública, mientras que
 * `settings` sí se lee desde el sitio. Mezclarlas sería a una policy de
 * distancia de filtrar un access token.
 *
 * Una fila por proveedor: la clave primaria es el proveedor. No hay caso de
 * dos cuentas de LinkedIn, y si lo hubiera es una migración, no un diseño
 * especulativo.
 */
create table public.social_accounts (
  provider      public.social_provider primary key,
  -- urn:li:person:xxxx — el autor de cada post. Se resuelve una vez al
  -- conectar y no en cada publicación: no cambia nunca.
  account_urn   text not null,
  account_name  text,
  access_token  text not null,
  -- Null es lo normal con una app self-serve: los refresh tokens programáticos
  -- son sólo para partners aprobados del Marketing Developer Platform. Sin él,
  -- `expires_at` es lo único que avisa que hay que reconectar.
  refresh_token text,
  expires_at    timestamptz not null,
  scopes        text not null,
  connected_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger social_accounts_updated_at before update on public.social_accounts
  for each row execute function public.set_updated_at();

alter table public.social_accounts enable row level security;

create policy social_accounts_admin_all on public.social_accounts
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

comment on table public.social_accounts is
  'Credenciales OAuth de las cuentas conectadas. Sin policy de lectura pública: acá viven access tokens.';
comment on column public.social_accounts.expires_at is
  'Vencimiento del access token. LinkedIn da 60 días; el panel avisa antes de que llegue.';
