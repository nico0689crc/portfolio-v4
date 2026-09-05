-- ============================================================================
-- Real date validation for `experiences.periods`
--
-- The previous CHECK matched shape only: `^\d{4}-\d{2}-\d{2}$` happily accepts
-- "2022-13-45". Testing that value showed it WAS rejected, but by the span
-- trigger's `::date` cast throwing 22008 — not by the constraint. So the
-- guarantee lived somewhere the constraint's own comment claimed it did not,
-- and only while the trigger exists and periods is non-null.
--
-- Casting inside the constraint instead puts the guarantee where it belongs.
-- Postgres has no TRY_CAST, hence plpgsql with a trapped exception.
-- ============================================================================

create or replace function public.is_valid_periods(v jsonb)
returns boolean language plpgsql immutable as $$
declare
  e jsonb;
begin
  if v is null then
    return true;
  end if;
  if jsonb_typeof(v) <> 'array' or jsonb_array_length(v) = 0 then
    return false;
  end if;

  for e in select value from jsonb_array_elements(v) loop
    if jsonb_typeof(e) <> 'object' or e->>'start_date' is null then
      return false;
    end if;
    begin
      perform (e->>'start_date')::date;
      if e->>'end_date' is not null then
        perform (e->>'end_date')::date;
      end if;
    exception
      when others then return false;
    end;
  end loop;

  return true;
end;
$$;

-- Re-assert the constraint so existing rows are re-validated against the
-- stricter function.
alter table public.experiences drop constraint experiences_periods_shape;
alter table public.experiences
  add constraint experiences_periods_valid check (public.is_valid_periods(periods));
