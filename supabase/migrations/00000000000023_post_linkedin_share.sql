-- Cross-post a LinkedIn de una nota, vía Buffer.
--
-- Vive en `post_translations` y no en `posts` porque sólo se comparte la
-- versión en español: es un dato por idioma, igual que `excerpt` o `status`.
--
-- Sin policy de RLS nueva: la tabla ya tiene `post_translations_admin_all`
-- para escritura desde el panel, y el cron que marca `linkedin_shared_at`
-- corre con la service-role key (no pasa por RLS). Tampoco se suma a ninguna
-- policy de lectura pública — el contenido público consulta columnas
-- explícitas (`src/lib/content/posts.ts`), así que estas tres quedan afuera
-- de esa selección aunque la policy de lectura las alcance.

alter table public.post_translations
  add column linkedin_message text,
  add column linkedin_shared_at timestamptz,
  add column linkedin_buffer_post_id text;

comment on column public.post_translations.linkedin_message is
  'Texto del post de LinkedIn, editado a mano. Null = se auto-genera desde título + bajada + link al publicar.';

comment on column public.post_translations.linkedin_shared_at is
  'Cuándo se agregó a la cola de Buffer. No nulo = ya procesado, el cron no lo reintenta.';

comment on column public.post_translations.linkedin_buffer_post_id is
  'Id que devuelve Buffer al crear el post. Sólo para debug/soporte, no se usa en ninguna consulta.';
