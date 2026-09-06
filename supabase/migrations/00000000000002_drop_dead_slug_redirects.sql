-- ============================================================================
-- Orphan slug redirects
--
-- Found by deleting a project against the real database: `slug_redirects` has
-- no foreign key to the entity it describes — it cannot have one, since the
-- parent table varies by `entity_type` — so deleting a project or post left
-- its redirects behind, still aiming at a slug that no longer resolves.
--
-- That is worse than no redirect at all: it walks a crawler from one indexed
-- URL to a 404 instead of letting the old URL answer 404 directly, which is
-- the correct signal for removed content.
--
-- Only rows whose `to_slug` died are dropped. A row whose `from_slug` matches
-- is a dead URL pointing at a live one, which is exactly what should be kept.
-- ============================================================================

create or replace function public.drop_dead_slug_redirects()
returns trigger language plpgsql as $$
declare
  kind text := TG_ARGV[0];
begin
  delete from public.slug_redirects
   where entity_type = kind
     and locale      = OLD.locale
     and to_slug     = OLD.slug;
  return OLD;
end;
$$;

create trigger project_translations_drop_redirects
  after delete on public.project_translations
  for each row execute function public.drop_dead_slug_redirects('project');

create trigger post_translations_drop_redirects
  after delete on public.post_translations
  for each row execute function public.drop_dead_slug_redirects('post');

create trigger tag_translations_drop_redirects
  after delete on public.tag_translations
  for each row execute function public.drop_dead_slug_redirects('tag');
