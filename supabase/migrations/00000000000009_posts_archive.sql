-- Archivar un artículo.
--
-- Va en `posts` y no en `post_translations` porque se archiva la nota entera,
-- no un idioma: un artículo retirado del sitio lo está en los dos, y un estado
-- por idioma abriría la puerta a que quede publicado en inglés y archivado en
-- castellano, que no significa nada.
--
-- Es una fecha y no un booleano porque «cuándo se retiró» es la pregunta que
-- se hace después, y un booleano obliga a mirar los logs para responderla.
--
-- No se suma al enum `content_status`: ese estado es por idioma y describe si
-- una traducción está lista. Archivar es otra cosa —la nota ya no va— y
-- mezclarlos haría imposible archivar algo conservando qué idiomas tenía
-- publicados para cuando se restaure.

alter table public.posts
  add column archived_at timestamptz;

comment on column public.posts.archived_at is
  'Cuándo se retiró del sitio. Null = activo. Conserva el estado por idioma para poder restaurar.';

create index posts_archived_idx on public.posts (archived_at);

-- La lectura pública ignora lo archivado, sin depender de que cada consumidor
-- se acuerde de filtrarlo.
drop policy if exists posts_public_read on public.posts;

create policy posts_public_read on public.posts
  for select to anon, authenticated
  using (
    archived_at is null
    and exists (
      select 1 from public.post_translations t
      where t.post_id = posts.id and t.status = 'published'
    )
  );
