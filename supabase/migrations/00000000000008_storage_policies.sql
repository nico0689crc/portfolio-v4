-- Permisos de Storage para el backoffice.
--
-- Sin esto ningún upload del panel funciona. `storage.objects` tiene RLS
-- activado por defecto y el proyecto no definía una sola policy, así que la
-- sesión del editor recibía "new row violates row-level security policy" en
-- cada intento — un error que no menciona Storage ni permisos y que es fácil
-- confundir con un problema del archivo.
--
-- El bucket `project-images` lo creó un script con la service_role key, que
-- pasa por encima de RLS; por eso el seed funcionaba y el panel no.

-- El bucket de medios de artículos se crea acá y no desde la app: crearlo
-- requiere escribir en `storage.buckets`, que ningún usuario autenticado puede
-- hacer, y descubrirlo en el primer upload es tarde.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media',
  'post-media',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

-- Los dos buckets de contenido, en una sola policy: el criterio es el mismo y
-- separarlas sólo agrega un lugar donde olvidarse de uno.
create policy content_media_admin_all on storage.objects
  for all to authenticated
  using (bucket_id in ('project-images', 'post-media') and public.is_admin())
  with check (bucket_id in ('project-images', 'post-media') and public.is_admin());

-- La lectura pública de un bucket `public` no pasa por RLS, así que no hace
-- falta una policy de select para servir las imágenes. Esta existe sólo para
-- que el panel pueda listar lo que hay, que sí es una consulta normal.
create policy content_media_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('project-images', 'post-media'));
