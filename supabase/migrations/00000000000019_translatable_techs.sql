-- Tecnologías traducibles por experiencia.
--
-- `experiences.techs` es una columna compartida entre idiomas, lo cual es
-- correcto para casi todo: "React", "Docker" o "PostgreSQL" son nombres propios
-- y traducirlos sería un error.
--
-- Pero la entrada de gastronomía no lista tecnologías: lista competencias
-- —"Leadership", "Time Management"— y esas sí se traducen. El CV en castellano
-- las mostraba en inglés.
--
-- El override por idioma sigue el mismo criterio que `skills.is_translatable`,
-- que ya distingue lo que se traduce de lo que no. Null significa "usá la
-- columna compartida", así que ninguna entrada existente cambia.

alter table public.experience_translations
  add column techs text[];

comment on column public.experience_translations.techs is
  'Sobrescribe experiences.techs para este idioma. Null usa la compartida.';

update public.experience_translations
set techs = array['Liderazgo', 'Gestión del tiempo', 'Adaptabilidad', 'Trabajo bajo presión']
where locale = 'es'
  and experience_id = (
    select id from public.experiences
    where organization = 'Restaurants and hotels (Oceania & Europe)'
  );
