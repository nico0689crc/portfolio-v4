-- La curaduría previa a la agenda: qué notas van a LinkedIn y cuáles no.
--
-- Hasta ahora la lista de candidatos era «todo lo publicado que no tenga turno»,
-- y eso no distingue entre una nota que todavía no se programó y una que no se
-- va a programar nunca. Con cincuenta y pico de artículos, las segundas vuelven
-- a aparecer cada semana y hay que volver a descartarlas de memoria.
--
-- Tabla propia y no una columna en `posts` por lo mismo que dice la 24: el
-- artículo no sabe nada de la difusión, y la referencia va en una sola
-- dirección, desde este módulo hacia el contenido. Una columna `share_decision`
-- en `posts` metería marketing adentro de la tabla que lee el sitio público.
--
-- La clave es (post_id, channel) y no (post_id, locale, channel) como en
-- `post_social_shares`: un envío es de una versión concreta en un idioma
-- concreto, pero la decisión es sobre la nota. Sólo se comparte el español, y
-- el día que se comparta el inglés la decisión de fondo —«esto vale la pena
-- difundirlo»— sigue siendo la misma.

create type public.social_share_decision as enum (
  'approved',  -- va a la agenda; falta elegirle turno
  'discarded'  -- no se difunde por este canal
);

-- «Sin decidir» es la ausencia de fila, no un tercer valor. Así el estado
-- inicial de las cincuenta y pico de notas que ya existen no necesita backfill,
-- y quitar una decisión es borrar y no volver a un enum que hay que interpretar.
create table public.post_social_decisions (
  post_id    uuid not null references public.posts (id) on delete cascade,
  channel    public.social_channel not null default 'linkedin',
  decision   public.social_share_decision not null,
  decided_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (post_id, channel)
);

create trigger post_social_decisions_updated_at before update on public.post_social_decisions
  for each row execute function public.set_updated_at();

alter table public.post_social_decisions enable row level security;

-- Mismo criterio que la agenda: sólo el panel. No es contenido, así que no hay
-- policy de lectura pública.
create policy post_social_decisions_admin_all on public.post_social_decisions
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

comment on table public.post_social_decisions is
  'Curaduría de difusión: qué notas se aprueban o se descartan para cada canal. Sin fila = sin decidir.';
comment on column public.post_social_decisions.decision is
  'approved: espera turno en la agenda. discarded: no se difunde. Sin fila: todavía no se miró.';
