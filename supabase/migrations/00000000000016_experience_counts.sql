-- Marca qué experiencias cuentan como trayectoria técnica.
--
-- Los años de experiencia dejan de ser un número escrito a mano en `settings`
-- para calcularse desde las fechas. Eso necesita saber qué sumar: la carrera
-- gastronómica es parte del CV y aporta a la historia, pero contarla como
-- experiencia de desarrollo sería falso.
--
-- Es una columna explícita y no una heurística sobre `techs` porque el criterio
-- es editorial. Adivinarlo por las tecnologías funcionaría hoy y se rompería en
-- la primera entrada que no encaje, sin que nadie lo note.

alter table public.experiences
  add column counts_as_experience boolean not null default true;

comment on column public.experiences.counts_as_experience is
  'Si suma a los años de experiencia calculados. False para trayectoria no técnica.';

update public.experiences
set counts_as_experience = false
where organization = 'Restaurants and hotels (Oceania & Europe)';

-- `years_of_experience` pasa a ser derivado, así que la fila deja de existir:
-- un valor editable que nadie lee es una mentira esperando a que alguien la
-- crea.
delete from public.settings where key = 'years_of_experience';
