-- Campos SEO de los artículos, con la misma forma que ya tienen los proyectos.
--
-- Hasta ahora el <title> de un post estaba forzado a ser igual a su H1 y la
-- meta description a su bajada. Son cosas distintas y se escriben distinto: el
-- H1 le habla a quien ya entró, el title tag le habla a quien está mirando una
-- lista de diez resultados y todavía no eligió. Un H1 como "Lo que la cocina me
-- enseñó sobre el software" funciona en la página y no compite por nada en la
-- SERP.
--
-- Todos son opcionales y caen al valor visible cuando están vacíos, así que un
-- artículo sigue publicándose sin tocarlos.

alter table public.post_translations
  -- Máximo práctico ~60 caracteres antes de que Google lo corte.
  add column seo_title       text,
  -- ~155 caracteres. No es un factor de ranking, pero decide el clic.
  add column seo_description text,
  -- La portada suele ser un recorte apaisado del artículo; la imagen social es
  -- 1200x630 y a menudo lleva texto, que cambia por idioma. Por eso va acá y no
  -- en `posts`.
  add column og_image        text,
  -- El alt de la portada es contenido, no metadato: describe la imagen para
  -- quien no la ve, y eso se traduce.
  add column cover_alt       text;

comment on column public.post_translations.seo_title is
  'Title tag. Si es null se usa `title`.';
comment on column public.post_translations.seo_description is
  'Meta description. Si es null se usa `excerpt`.';
comment on column public.post_translations.og_image is
  'Ruta en el bucket de portadas para la imagen social. Si es null se usa la portada.';
