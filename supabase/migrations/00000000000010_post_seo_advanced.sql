-- Atributos de SEO por artículo, siguiendo lo que la industria dio por bueno.
--
-- La pieza central es la frase clave: sin un objetivo declarado no hay nada
-- contra qué analizar el texto, y todos los chequeos de Yoast —aparece en el
-- título, en la URL, en el primer párrafo, en un subtítulo, en el alt de una
-- imagen— cuelgan de ella. Se guarda además de analizarse porque es la única
-- forma de saber después si dos notas están compitiendo por lo mismo.

alter table public.post_translations
  add column focus_keyphrase text,
  -- Título y descripción para redes, separados de los de buscador. Un titular
  -- que funciona en una SERP —preciso, con la palabra clave adelante— suele ser
  -- malo en un feed, donde compite por curiosidad y no por relevancia.
  add column og_title       text,
  add column og_description text;

comment on column public.post_translations.focus_keyphrase is
  'Frase clave objetivo. Base de todo el análisis del editor.';
comment on column public.post_translations.og_title is
  'Titular para redes. Null usa el título SEO, y en su defecto el visible.';
comment on column public.post_translations.og_description is
  'Descripción para redes. Null usa la descripción SEO, y en su defecto la bajada.';

-- Detectar dos artículos apuntando a la misma frase, que es como se canibalizan
-- entre ellos: los dos suben a medias y ninguno rankea.
create index post_translations_keyphrase_idx
  on public.post_translations (locale, focus_keyphrase)
  where focus_keyphrase is not null;
