-- Case study metrics render as a large figure above a caption ("+15%" over
-- "Projected conversion rate"), but the translation table only had a single
-- `text` column. The seed handed PostgREST the whole `{value, label}` object
-- from the message files and the text column stringified it, so every row now
-- holds a JSON blob rather than prose.
--
-- That shape is wrong for both consumers. The public page would have to
-- JSON.parse inside its render path, where a malformed row becomes a crashed
-- page instead of a bad string. And the backoffice could only ever show the
-- editor raw JSON, when the whole point is two labelled fields.
--
-- Splitting the pair into real columns is cheap now, with twelve rows and
-- nothing published, and expensive once either consumer is built on top of it.

alter table public.case_study_metric_translations
  add column value text,
  add column label text;

update public.case_study_metric_translations
set value = (case_study_metric_translations."text")::jsonb ->> 'value',
    label = (case_study_metric_translations."text")::jsonb ->> 'label';

-- Deliberately unguarded: if any row failed to convert, the migration should
-- stop here rather than leave the table half-migrated behind a silent skip.
alter table public.case_study_metric_translations
  alter column value set not null,
  alter column label set not null;

alter table public.case_study_metric_translations
  drop column "text";
