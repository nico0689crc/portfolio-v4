-- `updated_at` en las tablas de traducción que no lo tenían.
--
-- El sitemap declaraba la hora del build como `lastmod` de las dieciséis URLs.
-- Google lo dice explícito: cuando detecta que ese valor es la compilación y no
-- un cambio real de contenido, lo ignora — y se pierde la única señal que dice
-- "esto cambió, volvé a mirarlo".
--
-- Las tablas padre ya lo tenían con su trigger, pero el contenido que se ve
-- vive en las traducciones: editar un título desde el panel no tocaba ninguna
-- fecha. Sin esto no hay de dónde sacar un `lastmod` honesto.

alter table public.project_translations   add column updated_at timestamptz not null default now();
alter table public.page_seo_translations  add column updated_at timestamptz not null default now();
alter table public.experience_translations add column updated_at timestamptz not null default now();

create trigger project_translations_updated_at before update on public.project_translations
  for each row execute function public.set_updated_at();
create trigger page_seo_translations_updated_at before update on public.page_seo_translations
  for each row execute function public.set_updated_at();
create trigger experience_translations_updated_at before update on public.experience_translations
  for each row execute function public.set_updated_at();

-- Índices porque el sitemap pide el máximo por ruta en cada build.
create index project_translations_updated_idx on public.project_translations (updated_at desc);
create index page_seo_translations_updated_idx on public.page_seo_translations (updated_at desc);
