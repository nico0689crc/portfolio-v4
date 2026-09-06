-- ============================================================================
-- Interrupted positions
--
-- One position on the résumé ran in two stretches with a gap between them, and
-- its visible label says so: "Enero 2016 – Marzo 2022 | Enero 2023 - Enero
-- 2025". A single start_date/end_date pair cannot express that, so structured
-- data derived from those columns would claim nine unbroken years — asserting
-- something the page itself does not say, which Google's structured-data
-- guidelines treat as a violation rather than a rounding error.
--
-- Stored as jsonb rather than a child table: the array is tiny, never queried
-- and never ordered by, and one extra table for a single row that needs it is
-- disproportionate. This follows the same reasoning already applied to
-- `projects.links`.
--
-- What jsonb costs is Postgres' date validation, so that is recovered below
-- with a CHECK, and the outer span is derived by trigger instead of being
-- written by hand — the two could otherwise contradict each other, and the
-- column that orders the résumé would be the wrong one.
-- ============================================================================

create or replace function public.is_valid_periods(v jsonb)
returns boolean language sql immutable as $$
  select v is null or (
    jsonb_typeof(v) = 'array'
    and jsonb_array_length(v) > 0
    and not exists (
      select 1
        from jsonb_array_elements(v) e
       where jsonb_typeof(e) <> 'object'
          or e->>'start_date' is null
          or (e->>'start_date') !~ '^\d{4}-\d{2}-\d{2}$'
          or (e->>'end_date' is not null and (e->>'end_date') !~ '^\d{4}-\d{2}-\d{2}$')
    )
  );
$$;

alter table public.experiences
  add column periods jsonb,
  add constraint experiences_periods_shape check (public.is_valid_periods(periods));

comment on column public.experiences.periods is
  'Discrete stretches for an interrupted position: [{start_date, end_date}], '
  'end_date null while ongoing. Null when the position ran continuously. '
  'Structured data reads this; start_date/end_date are the outer span.';

-- Keeps the span honest. Writing both by hand lets them disagree, and the span
-- is what orders the list, so the wrong one would win.
create or replace function public.sync_experience_span()
returns trigger language plpgsql as $$
begin
  if new.periods is not null then
    select min((e->>'start_date')::date),
           -- A null end anywhere means the position is still current, so the
           -- span stays open rather than closing at the latest known date.
           case when bool_or(e->>'end_date' is null) then null
                else max((e->>'end_date')::date) end
      into new.start_date, new.end_date
      from jsonb_array_elements(new.periods) e;
  end if;
  return new;
end;
$$;

create trigger experiences_sync_span
  before insert or update on public.experiences
  for each row execute function public.sync_experience_span();
