-- Prompt de imagen de portada, guardado junto al post que lo usa.
--
-- Vive en `posts` y no en `post_translations` porque la portada es una sola
-- para todos los idiomas: la misma imagen sirve la card de OG en español y en
-- inglés, así que duplicar el prompt por idioma sólo abre la puerta a que las
-- dos versiones terminen describiendo imágenes distintas.
--
-- El texto se guarda en inglés a propósito. Los generadores de imagen rinden
-- notablemente mejor en inglés, y el prompt no es contenido del sitio: nunca se
-- renderiza, sólo se copia desde el panel hacia la herramienta de turno.

alter table public.posts
  add column image_prompt text;

comment on column public.posts.image_prompt is
  'Prompt en inglés para generar la portada con IA. No se renderiza en el sitio.';
