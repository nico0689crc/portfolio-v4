-- ============================================================================
-- The visible company label
--
-- `experiences.organization` was made language-neutral so structured data can
-- name the employer as an entity, and that is right for schema.org. But the
-- label the résumé actually renders is translated prose that does not derive
-- from it:
--
--   organization 'Self-employed'                       ES "Autónomo - Corrientes, Argentina"
--                                                      EN "Freelance - Corrientes, Argentina"
--   organization 'Restaurants and hotels (Oceania...)' ES "Oceanía y Europa"
--                                                      EN "Oceania and Europe"
--
-- Rebuilding it from organization + location would print "Self-employed" on the
-- Spanish page, and the second row has no employer name in the visible label at
-- all — only a region. So the label is its own translated column, and the
-- neutral columns stay for the markup.
--
-- Nullable rather than NOT NULL: the rows already exist, and the reader falls
-- back to `organization` when it is absent, so a row seeded before this column
-- existed still renders something sane instead of blank.
-- ============================================================================

alter table public.experience_translations add column company text;

comment on column public.experience_translations.company is
  'Visible employer label, translated prose (e.g. "Autónomo - Corrientes, '
  'Argentina"). Rendered by the résumé. Structured data uses '
  'experiences.organization and this table''s location instead.';
