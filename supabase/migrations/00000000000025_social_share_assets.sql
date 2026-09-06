-- Media en los envíos: portada, o un PDF para el carrusel de LinkedIn.
--
-- `assets` es jsonb y no una tabla hija, a diferencia de los envíos mismos:
-- nunca se consultan sueltos —siempre se leen con su envío—, no se filtra ni
-- se ordena por ellos, y el orden dentro del posteo es el del array, que una
-- tabla obligaría a sostener con una columna de posición.
--
-- Null es "automático", igual que en `message`: se resuelve al entregar y
-- adjunta la portada vigente del artículo. Un array vacío es la decisión
-- explícita de publicar sin media. Los dos casos son distintos y por eso la
-- columna no tiene default.

alter table public.post_social_shares
  add column assets jsonb,
  add column link_in_first_comment boolean not null default true;

alter table public.post_social_shares
  add constraint post_social_shares_assets_is_array
  check (assets is null or jsonb_typeof(assets) = 'array');

comment on column public.post_social_shares.assets is
  'Media adjunta, en orden. Null = portada del artículo. [] = sin media. Cada item: {kind:"image"|"document", url, ...}.';

comment on column public.post_social_shares.link_in_first_comment is
  'Con media adjunta LinkedIn ya no arma la tarjeta de preview, así que el link rinde más como primer comentario que perdido en el texto.';

-- El bucket sólo aceptaba imágenes. El carrusel de LinkedIn es un PDF de
-- varias páginas —LinkedIn eliminó el carrusel multi-imagen nativo—, así que
-- sin este mime type no hay forma de subirlo. El tope sube a 25 MB por lo
-- mismo: un PDF de diez láminas no entra cómodo en 10.
update storage.buckets
set
  allowed_mime_types = array[
    'image/png', 'image/jpeg', 'image/webp', 'image/avif', 'application/pdf'
  ],
  file_size_limit = 26214400
where id = 'post-media';
