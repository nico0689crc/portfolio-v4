-- Puestos individuales dentro de una experiencia agrupada.
--
-- La carrera gastronómica son quince puestos entre 2011 y 2025, en cinco
-- países. En el CV normal van agrupados en una sola entrada a propósito:
-- desplegarlos empuja la experiencia técnica fuera de la primera pantalla de
-- cualquier reclutador.
--
-- Pero el detalle existe y vale: es lo que sostiene la afirmación de "nueve años
-- en cocinas profesionales". Guardarlo permite dos cosas que antes no se podían
-- —desplegarlo en el sitio y generar una versión extendida del CV— sin que la
-- versión corta pierda su foco.
--
-- La tabla es genérica, no específica de cocina: cualquier experiencia agrupada
-- puede tener puestos hijos.

create table public.experience_roles (
  id            uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences (id) on delete cascade,
  organization  text not null,
  location      text,
  start_date    date,
  end_date      date,
  sort_order    int not null default 0
);

create index experience_roles_parent_idx on public.experience_roles (experience_id, sort_order);

create table public.experience_role_translations (
  role_id     uuid not null references public.experience_roles (id) on delete cascade,
  locale      text not null references public.locales (code) on delete cascade,
  title       text not null,
  date_label  text,
  description text,
  primary key (role_id, locale)
);

alter table public.experience_roles enable row level security;
alter table public.experience_role_translations enable row level security;

create policy experience_roles_admin_all on public.experience_roles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy experience_role_translations_admin_all on public.experience_role_translations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy experience_roles_public_read on public.experience_roles
  for select to anon, authenticated using (true);
create policy experience_role_translations_public_read on public.experience_role_translations
  for select to anon, authenticated using (true);
