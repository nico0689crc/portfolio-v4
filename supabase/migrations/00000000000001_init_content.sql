-- ============================================================================
-- Portafolio v3 — content schema
--
-- Every piece of user-facing content lives here, and every translatable value
-- lives in a `*_translations` table keyed by (parent_id, locale). Adding a
-- language is inserting rows, never altering a table.
--
-- Two content layers:
--   A. Entities  — projects, case studies, experience, skills, FAQ, SEO.
--   B. UI strings — flat `Namespace.key.path` leaves consumed by next-intl.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Backoffice access list. A row here is what makes an authenticated Supabase
-- user an editor; RLS never checks emails or JWT claims directly.
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create type public.content_status as enum ('draft', 'published');

-- ---------------------------------------------------------------------------
-- Locales
-- ---------------------------------------------------------------------------

create table public.locales (
  code        text primary key,             -- 'es', 'en', 'pt-BR'
  name        text not null,                -- 'Spanish'
  native_name text not null,                -- 'Español'
  is_default  boolean not null default false,
  enabled     boolean not null default true,
  sort_order  int not null default 0
);

-- Only one default locale, enforced by the index rather than a trigger.
create unique index locales_single_default on public.locales (is_default) where is_default;

insert into public.locales (code, name, native_name, is_default, sort_order) values
  ('en', 'English', 'English', true,  0),
  ('es', 'Spanish', 'Español', false, 1);

-- ---------------------------------------------------------------------------
-- Layer B — UI strings
--
-- `ui_message_keys` is the schema (which keys exist, what they mean);
-- `ui_messages` holds one value per locale. Splitting them is what lets the
-- dashboard show "3 keys missing in EN" instead of silently rendering blanks.
-- ---------------------------------------------------------------------------

create table public.ui_message_keys (
  key         text primary key,             -- 'Contact.form.send'
  namespace   text not null,                -- 'Contact'  (key's first segment)
  notes       text,                         -- context for translating
  -- Some values are interpolated into dangerouslySetInnerHTML (About.about.p1).
  -- Flagged so the editor can warn and the renderer can sanitize.
  allows_html boolean not null default false,
  sort_order  int not null default 0
);

create index ui_message_keys_namespace_idx on public.ui_message_keys (namespace);

create table public.ui_messages (
  key        text not null references public.ui_message_keys (key) on delete cascade,
  locale     text not null references public.locales (code) on delete cascade,
  value      text not null,
  updated_at timestamptz not null default now(),
  primary key (key, locale)
);

create trigger ui_messages_updated_at before update on public.ui_messages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Layer A — Projects
--
-- Both halves of a project URL are translated: next-intl localizes the route
-- segment (/projects vs /es/proyectos) and the slug itself lives in
-- project_translations. `projects.key` is the stable identity underneath.
-- ---------------------------------------------------------------------------

create table public.projects (
  id           uuid primary key default gen_random_uuid(),
  -- Stable internal identifier, NOT a URL. Slugs are per-locale (see
  -- project_translations), so anything that must mean the same thing in every
  -- language keys off this: GA4 event parameters, OG image filenames, the seed
  -- script. Without it a click on the ES page and the EN page would report as
  -- two different projects.
  key          text not null unique,
  category     text not null,               -- 'fullstack' | 'ux-ui' | 'wordpress'
  techs        text[] not null default '{}',
  -- { demo, github, canva, figjam, lofi } — sparse and link-shaped, so jsonb
  -- beats five nullable columns.
  links        jsonb not null default '{}'::jsonb,
  og_image     text,
  status       public.content_status not null default 'draft',
  published_at timestamptz,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_translations (
  project_id      uuid not null references public.projects (id) on delete cascade,
  locale          text not null references public.locales (code) on delete cascade,
  -- The URL slug is translated, so it lives here and is unique per locale.
  -- Renaming one records a row in `slug_redirects` automatically, by trigger.
  slug            text not null,
  title           text not null,
  description     text not null,
  seo_title       text,
  seo_description text,
  noindex         boolean not null default false,
  primary key (project_id, locale),
  unique (locale, slug)
);

-- Remote images lose the build-time width/height/blur that `StaticImageData`
-- gave us, so the uploader computes them once and stores them here.
create table public.project_images (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  storage_path  text not null,
  width         int not null,
  height        int not null,
  blur_data_url text,
  sort_order    int not null default 0
);

create index project_images_project_idx on public.project_images (project_id, sort_order);

create table public.project_image_translations (
  image_id uuid not null references public.project_images (id) on delete cascade,
  locale   text not null references public.locales (code) on delete cascade,
  alt      text not null,
  primary key (image_id, locale)
);

-- ---------------------------------------------------------------------------
-- Case studies
-- ---------------------------------------------------------------------------

create table public.case_studies (
  project_id uuid primary key references public.projects (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create trigger case_studies_updated_at before update on public.case_studies
  for each row execute function public.set_updated_at();

-- role/duration/team read as metadata but are prose in both languages
-- ("2 developers, 1 product owner"), so they are translatable.
create table public.case_study_translations (
  project_id      uuid not null references public.case_studies (project_id) on delete cascade,
  locale          text not null references public.locales (code) on delete cascade,
  overview        text,
  role            text,
  duration        text,
  team            text,
  context         text,
  problem         text,
  process_desc    text,
  results         text,
  learnings       text,
  note_html       text,   -- e.g. the Mexx diploma note
  note_url        text,
  note_link_text  text,
  primary key (project_id, locale)
);

-- Phases are rows, not columns: the five Design Thinking defaults are shared,
-- but a project can relabel or add its own (Mexx overrides all five).
create table public.case_study_phases (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.case_studies (project_id) on delete cascade,
  slug       text not null,                 -- 'empathize' | 'define' | ...
  sort_order int not null default 0,
  unique (project_id, slug)
);

create table public.case_study_phase_translations (
  phase_id uuid not null references public.case_study_phases (id) on delete cascade,
  locale   text not null references public.locales (code) on delete cascade,
  label    text,                            -- 'Fase 1'
  title    text,                            -- 'Empatizar'
  body     text,                            -- markdown
  primary key (phase_id, locale)
);

create table public.case_study_metrics (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.case_studies (project_id) on delete cascade,
  sort_order int not null default 0
);

create table public.case_study_metric_translations (
  metric_id uuid not null references public.case_study_metrics (id) on delete cascade,
  locale    text not null references public.locales (code) on delete cascade,
  text      text not null,
  primary key (metric_id, locale)
);

-- ---------------------------------------------------------------------------
-- Résumé content
-- ---------------------------------------------------------------------------

create table public.experiences (
  id              uuid primary key default gen_random_uuid(),
  -- Proper noun, identical in every language, so it never reaches a
  -- translations table. `location` does get translated.
  organization    text not null,
  employment_type text not null default 'FULL_TIME',
  remote          boolean not null default false,
  techs      text[] not null default '{}',
  start_date date,
  end_date   date,                          -- null = current
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger experiences_updated_at before update on public.experiences
  for each row execute function public.set_updated_at();

-- `date_label` is kept alongside start/end because the rendered string is
-- editorial ("Marzo, 2025 - Actualidad") and localized, while the real dates
-- drive ordering and JSON-LD.
create table public.experience_translations (
  experience_id uuid not null references public.experiences (id) on delete cascade,
  locale        text not null references public.locales (code) on delete cascade,
  role          text not null,
  location      text not null,
  date_label    text not null,
  description   text not null,
  primary key (experience_id, locale)
);

-- Education and certifications, taken from the CV. Institution and issuer are
-- proper nouns; the degree and certificate names are not.
create table public.education (
  id         uuid primary key default gen_random_uuid(),
  institution text not null,
  url        text,
  start_date date,
  end_date   date,                          -- null = in progress
  sort_order int not null default 0
);

-- `date_label` mirrors experience_translations: the rendered date is editorial
-- prose per language ("En curso · finalización esperada 2025"), not a format of
-- start_date/end_date, and the résumé renders it unconditionally.
create table public.education_translations (
  education_id uuid not null references public.education (id) on delete cascade,
  locale       text not null references public.locales (code) on delete cascade,
  degree       text not null,
  date_label   text not null,
  location     text,
  primary key (education_id, locale)
);

create table public.certifications (
  id         uuid primary key default gen_random_uuid(),
  issuer     text not null,
  year       int not null,
  url        text,
  sort_order int not null default 0
);

create table public.certification_translations (
  certification_id uuid not null references public.certifications (id) on delete cascade,
  locale           text not null references public.locales (code) on delete cascade,
  name             text not null,
  primary key (certification_id, locale)
);

create table public.skill_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,          -- 'frontend', 'soft'
  sort_order int not null default 0
);

create table public.skill_category_translations (
  category_id uuid not null references public.skill_categories (id) on delete cascade,
  locale      text not null references public.locales (code) on delete cascade,
  label       text not null,
  primary key (category_id, locale)
);

-- Technical skill names are proper nouns and identical in every language;
-- soft skills are not. `is_translatable` decides which editor the dashboard
-- shows and whether the name falls back to `name_default`.
create table public.skills (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid not null references public.skill_categories (id) on delete cascade,
  name_default    text not null,
  is_translatable boolean not null default false,
  sort_order      int not null default 0
);

create table public.skill_translations (
  skill_id uuid not null references public.skills (id) on delete cascade,
  locale   text not null references public.locales (code) on delete cascade,
  name     text not null,
  primary key (skill_id, locale)
);

create table public.resume_highlights (
  id         uuid primary key default gen_random_uuid(),
  sort_order int not null default 0
);

create table public.resume_highlight_translations (
  highlight_id uuid not null references public.resume_highlights (id) on delete cascade,
  locale       text not null references public.locales (code) on delete cascade,
  label        text not null,
  value        text not null,
  primary key (highlight_id, locale)
);

create table public.faqs (
  id         uuid primary key default gen_random_uuid(),
  sort_order int not null default 0
);

create table public.faq_translations (
  faq_id   uuid not null references public.faqs (id) on delete cascade,
  locale   text not null references public.locales (code) on delete cascade,
  question text not null,
  answer   text not null,
  primary key (faq_id, locale)
);

-- ---------------------------------------------------------------------------
-- Blog
--
-- Unlike every other content type here, a post does NOT have to exist in every
-- language: writing one in Spanish and never translating it is normal. That
-- single fact drives the whole shape below — publication state, slug and dates
-- all live per translation, never on the parent.
--
-- The SEO consequence is concrete: a post's hreflang cluster may only list the
-- locales actually published. Emitting hreflang="en" for a URL that 404s makes
-- Google discard the entire cluster, including the language that does exist.
-- ---------------------------------------------------------------------------

create table public.posts (
  id                  uuid primary key default gen_random_uuid(),
  -- Stable internal id, same role as projects.key: analytics and OG filenames.
  key                 text not null unique,
  -- Featured image. 1200x630 so the same asset serves the OG card.
  cover_path          text,
  cover_width         int,
  cover_height        int,
  cover_blur_data_url text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

create table public.post_translations (
  post_id      uuid not null references public.posts (id) on delete cascade,
  locale       text not null references public.locales (code) on delete cascade,
  slug         text not null,
  title        text not null,
  excerpt      text not null,          -- description + og:description
  body         text not null,          -- markdown
  -- Publication state is per language, not inherited from the parent.
  status       public.content_status not null default 'draft',
  published_at timestamptz,            -- datePublished
  -- datePublished/dateModified for BlogPosting. `content_updated_at` is set
  -- deliberately by the editor, NOT by the updated_at trigger: fixing a typo
  -- must not advertise the post as freshly updated.
  content_updated_at timestamptz,
  reading_minutes int,
  word_count      int,
  noindex      boolean not null default false,
  updated_at   timestamptz not null default now(),
  primary key (post_id, locale),
  unique (locale, slug)
);

create trigger post_translations_updated_at before update on public.post_translations
  for each row execute function public.set_updated_at();

create index post_translations_published_idx
  on public.post_translations (locale, published_at desc)
  where status = 'published';

-- Tags are entities rather than a text[] so a rename happens once, and so the
-- per-locale slug already exists the day tag pages ship. There is no author
-- table on purpose: the author is always the same Person @id.
create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  sort_order int not null default 0
);

create table public.tag_translations (
  tag_id uuid not null references public.tags (id) on delete cascade,
  locale text not null references public.locales (code) on delete cascade,
  slug   text not null,
  name   text not null,
  primary key (tag_id, locale),
  unique (locale, slug)
);

create table public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id  uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- Per-page SEO — replaces the 18 `Metadata.*` keys
-- ---------------------------------------------------------------------------

create table public.page_seo (
  route_key  text primary key,              -- '/', '/about', '/portfolio'
  sort_order int not null default 0
);

create table public.page_seo_translations (
  route_key   text not null references public.page_seo (route_key) on delete cascade,
  locale      text not null references public.locales (code) on delete cascade,
  title       text not null,
  description text not null,
  og_image    text,
  -- Only ever restricts, never redirects. Canonical and hreflang stay computed
  -- from `routing`, never editable: a hand-edited canonical is how every page
  -- in one language ends up de-indexing itself.
  noindex     boolean not null default false,
  primary key (route_key, locale)
);

-- ---------------------------------------------------------------------------
-- Site settings, redirects, inbox
-- ---------------------------------------------------------------------------

-- Social links, contact email, CV file per locale, job title.
create table public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- Hand-authored redirects for whole-section moves. Slug renames are NOT
-- recorded here; they go through `slug_redirects` below, automatically.
create table public.redirects (
  from_path  text primary key,
  to_path    text not null,
  permanent  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Slug history
--
-- The single most important SEO guarantee in the backoffice, and the one that
-- is invisible until the traffic is already gone: renaming a slug orphans an
-- indexed URL. Relying on the editor to remember to add a redirect means it
-- never happens, so a trigger records it.
--
-- Slugs are stored, not paths: the localized route segment (/projects vs
-- /es/proyectos) is decided by `routing.pathnames` in the app, and duplicating
-- that in SQL would be a second source of truth that silently drifts. The app
-- turns a hit into a path with getPathname().
--
-- Resolution is lazy and free on the happy path: the project or post page only
-- queries this table when the slug matched no row, and then redirects instead
-- of returning a 404. No per-request middleware lookup.
--
-- Two things the consuming page MUST get right, or this table silently becomes
-- decorative — the redirect works in a browser either way, so nothing looks
-- broken while the SEO value is lost:
--
--   1. Redirect with `permanentRedirect` from src/i18n/routing.ts, never with
--      `redirect`. Verified in next@16.1.6: redirect() throws 307 and
--      permanentRedirect() throws 308. Google reads 307 as temporary, keeps the
--      old URL indexed and transfers no ranking — precisely the damage this
--      table exists to prevent. Use next-intl's export, not next/navigation's,
--      so the destination resolves to the localized pathname
--      (/es/proyectos/<slug>, not /es/projects/<slug>).
--
--   2. Leave `dynamicParams` at its default of true on the project and post
--      pages. Lazy resolution requires the page to run for a slug that is not
--      in generateStaticParams; with `dynamicParams = false` Next answers 404
--      without ever executing the component, and every redirect here stops
--      firing. It reads like a harmless optimisation, which is exactly why it
--      needs to be written down.
-- ---------------------------------------------------------------------------

create table public.slug_redirects (
  entity_type text not null,                -- 'project' | 'post' | 'tag'
  locale      text not null references public.locales (code) on delete cascade,
  from_slug   text not null,
  to_slug     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (entity_type, locale, from_slug)
);

create or replace function public.record_slug_redirect()
returns trigger language plpgsql as $$
declare
  kind text := TG_ARGV[0];
begin
  if NEW.slug is distinct from OLD.slug then
    -- Re-point what already aimed at the old slug rather than chaining: a
    -- rename A->B followed by B->C must leave A->C, not A->B->C. Google
    -- follows chains but dilutes signal and abandons the longer ones.
    update public.slug_redirects
       set to_slug = NEW.slug, updated_at = now()
     where entity_type = kind and locale = OLD.locale and to_slug = OLD.slug;

    insert into public.slug_redirects (entity_type, locale, from_slug, to_slug)
    values (kind, OLD.locale, OLD.slug, NEW.slug)
    on conflict (entity_type, locale, from_slug)
      do update set to_slug = excluded.to_slug, updated_at = now();

    -- Renaming a slug back to an earlier value would otherwise leave A -> A.
    delete from public.slug_redirects
     where entity_type = kind and locale = OLD.locale and from_slug = to_slug;
  end if;
  return NEW;
end;
$$;

create trigger project_translations_slug_redirect
  after update of slug on public.project_translations
  for each row execute function public.record_slug_redirect('project');

create trigger post_translations_slug_redirect
  after update of slug on public.post_translations
  for each row execute function public.record_slug_redirect('post');

create trigger tag_translations_slug_redirect
  after update of slug on public.tag_translations
  for each row execute function public.record_slug_redirect('tag');

create type public.message_status as enum ('new', 'read', 'replied', 'spam');

-- Today sendEmail() fires a mail and the lead is gone; this keeps it.
create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  locale     text,
  ip         text,
  user_agent text,
  status     public.message_status not null default 'new',
  created_at timestamptz not null default now()
);

create index contact_messages_created_idx on public.contact_messages (created_at desc);

-- ============================================================================
-- Row Level Security
--
-- The public site reads with the anon key, so RLS is the only thing keeping
-- drafts off the internet. The service-role key is never shipped to a client.
-- ============================================================================

do $$
declare t text;
begin
  foreach t in array array[
    'admins','locales','ui_message_keys','ui_messages',
    'projects','project_translations','project_images','project_image_translations',
    'case_studies','case_study_translations','case_study_phases',
    'case_study_phase_translations','case_study_metrics','case_study_metric_translations',
    'experiences','experience_translations','education','education_translations',
    'certifications','certification_translations',
    'skill_categories','skill_category_translations',
    'skills','skill_translations','resume_highlights','resume_highlight_translations',
    'faqs','faq_translations','page_seo','page_seo_translations',
    'posts','post_translations','tags','tag_translations','post_tags',
    'settings','redirects','slug_redirects','contact_messages'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    -- Admins do everything, everywhere.
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.is_admin()) with check (public.is_admin())',
      t || '_admin_all', t);
  end loop;
end $$;

-- Anonymous reads: everything except projects is site chrome and always
-- visible; project-owned rows are gated on the parent project being published.
do $$
declare t text;
begin
  foreach t in array array[
    'locales','ui_message_keys','ui_messages',
    'experiences','experience_translations','education','education_translations',
    'certifications','certification_translations',
    'skill_categories','skill_category_translations',
    'skills','skill_translations','resume_highlights','resume_highlight_translations',
    'faqs','faq_translations','page_seo','page_seo_translations',
    'tags','tag_translations','post_tags','settings','redirects','slug_redirects'
  ] loop
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_public_read', t);
  end loop;
end $$;

create policy projects_public_read on public.projects
  for select to anon, authenticated
  using (status = 'published');

create or replace function public.project_is_published(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.projects p where p.id = pid and p.status = 'published');
$$;

create policy project_translations_public_read on public.project_translations
  for select to anon, authenticated using (public.project_is_published(project_id));

create policy project_images_public_read on public.project_images
  for select to anon, authenticated using (public.project_is_published(project_id));

create policy project_image_translations_public_read on public.project_image_translations
  for select to anon, authenticated
  using (exists (
    select 1 from public.project_images i
    where i.id = image_id and public.project_is_published(i.project_id)
  ));

create policy case_studies_public_read on public.case_studies
  for select to anon, authenticated using (public.project_is_published(project_id));

create policy case_study_translations_public_read on public.case_study_translations
  for select to anon, authenticated using (public.project_is_published(project_id));

create policy case_study_phases_public_read on public.case_study_phases
  for select to anon, authenticated using (public.project_is_published(project_id));

create policy case_study_phase_translations_public_read on public.case_study_phase_translations
  for select to anon, authenticated
  using (exists (
    select 1 from public.case_study_phases f
    where f.id = phase_id and public.project_is_published(f.project_id)
  ));

create policy case_study_metrics_public_read on public.case_study_metrics
  for select to anon, authenticated using (public.project_is_published(project_id));

create policy case_study_metric_translations_public_read on public.case_study_metric_translations
  for select to anon, authenticated
  using (exists (
    select 1 from public.case_study_metrics m
    where m.id = metric_id and public.project_is_published(m.project_id)
  ));

-- A post is visible when ANY of its translations is published; each translation
-- gates itself. This is what lets /es/blog/foo exist while /blog/foo does not.
create policy posts_public_read on public.posts
  for select to anon, authenticated
  using (exists (
    select 1 from public.post_translations t
    where t.post_id = posts.id and t.status = 'published'
  ));

create policy post_translations_public_read on public.post_translations
  for select to anon, authenticated using (status = 'published');

-- The contact form inserts as anon and nobody but an admin may read it back.
create policy contact_messages_anon_insert on public.contact_messages
  for insert to anon, authenticated with check (true);

-- ============================================================================
-- Translation coverage
--
-- The dashboard's "EN is 94% complete" badge and the missing-string report
-- both read from here, so a half-translated locale is visible before it ships
-- rather than after a blank renders in production.
-- ============================================================================

create or replace view public.ui_message_coverage as
  select l.code as locale,
         k.namespace,
         count(*)                          as total_keys,
         count(m.value)                    as translated_keys,
         count(*) - count(m.value)         as missing_keys
    from public.ui_message_keys k
   cross join public.locales l
    left join public.ui_messages m on m.key = k.key and m.locale = l.code
   where l.enabled
   group by l.code, k.namespace;

create or replace view public.ui_messages_missing as
  select l.code as locale, k.key, k.namespace, k.notes
    from public.ui_message_keys k
   cross join public.locales l
    left join public.ui_messages m on m.key = k.key and m.locale = l.code
   where l.enabled and m.value is null;
