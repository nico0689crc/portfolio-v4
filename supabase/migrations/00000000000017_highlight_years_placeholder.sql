-- El destacado de años deja de llevar el número escrito.
--
-- Los años de experiencia ahora se calculan desde las fechas de cada puesto, y
-- este destacado era el último lugar donde el número seguía a mano. Un valor
-- fijo acá significa que el día que se agregue una experiencia, la página va a
-- mostrar dos cifras distintas sin que nada lo advierta.
--
-- `{years}` lo sustituye quien renderiza. Es el mismo marcador que ya usan los
-- textos de UI, así que el editor lo reconoce si necesita reescribir la frase.

update public.resume_highlight_translations
set value = '+{years} años'
where locale = 'es' and value like '%3%' and label = 'Experiencia';

update public.resume_highlight_translations
set value = '{years}+ years'
where locale = 'en' and value like '%3%' and label = 'Experience';
