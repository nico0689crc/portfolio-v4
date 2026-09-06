import { supabasePublic } from '@/lib/supabase/public';
import { cached } from './cache';
import { TAGS } from './tags';
import { orThrow, pick } from './internal';
import type { PostDetail, PostSummary, SlugMapEntry, Tag } from './types';

/**
 * Blog.
 *
 * Unlike every other content type, a post does not have to exist in both
 * languages — writing one in Spanish and never translating it is normal. So
 * publication state, slug and dates all live per translation, and every query
 * here filters on the translation's own `status`.
 */

/**
 * Un post publicado con fecha futura está programado, no publicado.
 *
 * Sin este corte, `status = 'published'` alcanzaba para que la nota apareciera
 * en el listado el día que se carga, ordenada primera y mostrando una fecha que
 * todavía no llegó. Con el corte, cargar la agenda entera de antemano es
 * seguro: cada nota se publica sola cuando le toca.
 *
 * No hace falta cron. Las lecturas vencen a los `MAX_AGE_SECONDS` de
 * `cache.ts`, así que la nota aparece dentro del minuto de su fecha.
 */
const nowIso = () => new Date().toISOString();

/**
 * En desarrollo la agenda se ve entera: las notas programadas aparecen en el
 * listado junto a las publicadas, ordenadas primero por ser las más nuevas.
 *
 * Es la única forma de releer la cola completa en contexto —en el listado, con
 * su portada y su bajada— antes de que salga. Revisar quince notas entrando una
 * por una a su vista previa no es lo mismo.
 *
 * No alcanza para los borradores, y no puede: la policy
 * `post_translations_public_read` filtra por `status = 'published'` en la base,
 * así que el cliente anónimo no los ve ni pidiéndolos. Para eso está
 * `/preview/blog/<key>`, que lee con la sesión del editor.
 */
const SHOW_SCHEDULED = process.env.NODE_ENV === 'development';

export const getPosts = cached(
  async (locale: string): Promise<PostSummary[]> => {
    const query = supabasePublic
      .from('post_translations')
      .select(
        `slug, title, excerpt, published_at, content_updated_at, reading_minutes, noindex,
         seo_title, seo_description, og_image, og_title, og_description, cover_alt,
         posts!inner(key, cover_path, cover_width, cover_height)`
      )
      .eq('locale', locale)
      .eq('status', 'published');

    const rows = orThrow(
      'getPosts',
      await (SHOW_SCHEDULED ? query : query.lte('published_at', nowIso())).order('published_at', {
        ascending: false
      })
    );

    return rows.map((row) => ({
      key: row.posts.key,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      publishedAt: row.published_at,
      contentUpdatedAt: row.content_updated_at,
      readingMinutes: row.reading_minutes,
      coverPath: row.posts.cover_path,
      coverWidth: row.posts.cover_width,
      coverHeight: row.posts.cover_height,
      noindex: row.noindex,
      seoTitle: row.seo_title,
      seoDescription: row.seo_description,
      ogImage: row.og_image,
      ogTitle: row.og_title,
      ogDescription: row.og_description,
      coverAlt: row.cover_alt
    }));
  },
  ['posts'],
  [TAGS.posts, TAGS.all]
);

export const getPost = cached(
  async (slug: string, locale: string): Promise<PostDetail | null> => {
    const detail = supabasePublic
      .from('post_translations')
      .select(
        `slug, title, excerpt, body, published_at, content_updated_at,
         reading_minutes, word_count, noindex,
         seo_title, seo_description, og_image, og_title, og_description, cover_alt,
         posts!inner(key, cover_path, cover_width, cover_height, cover_blur_data_url,
                     post_tags(tags(key, tag_translations(locale, slug, name))))`
      )
      .eq('slug', slug)
      .eq('locale', locale)
      .eq('status', 'published');

    const { data, error } = await (SHOW_SCHEDULED ? detail : detail.lte('published_at', nowIso())).maybeSingle();

    if (error) throw new Error(`content/getPost: ${error.message}`);
    if (!data) return null;

    const tags: Tag[] = data.posts.post_tags.flatMap((pt) => {
      const t = pick(pt.tags.tag_translations, locale);
      return t ? [{ key: pt.tags.key, slug: t.slug, name: t.name }] : [];
    });

    return {
      key: data.posts.key,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      publishedAt: data.published_at,
      contentUpdatedAt: data.content_updated_at,
      readingMinutes: data.reading_minutes,
      wordCount: data.word_count,
      coverPath: data.posts.cover_path,
      coverWidth: data.posts.cover_width,
      coverHeight: data.posts.cover_height,
      coverBlurDataUrl: data.posts.cover_blur_data_url,
      noindex: data.noindex,
      seoTitle: data.seo_title,
      seoDescription: data.seo_description,
      ogImage: data.og_image,
      ogTitle: data.og_title,
      ogDescription: data.og_description,
      coverAlt: data.cover_alt,
      tags
    };
  },
  ['post'],
  [TAGS.posts, TAGS.all]
);

/**
 * Each post's slugs, containing **only the locales actually published**.
 *
 * That omission is the hreflang guarantee: if a key is absent, the version does
 * not exist and must not be declared. Emitting `hreflang="en"` for a URL that
 * 404s makes Google discard the whole cluster, including the language that does
 * exist — so the caller never has to ask a second question.
 */
export const getPostSlugMap = cached(
  async (): Promise<SlugMapEntry[]> => {
    const rows = orThrow(
      'getPostSlugMap',
      await supabasePublic
        .from('posts')
        .select('key, post_translations(locale, slug, status, published_at)')
    );

    const now = nowIso();

    return rows
      .map((row) => ({
        key: row.key,
        slugs: Object.fromEntries(
          row.post_translations
            .filter(
              (t) =>
                t.status === 'published' &&
                (SHOW_SCHEDULED || (t.published_at !== null && t.published_at <= now))
            )
            .map((t) => [t.locale, t.slug])
        )
      }))
      .filter((entry) => Object.keys(entry.slugs).length > 0);
  },
  ['post-slug-map'],
  [TAGS.posts, TAGS.all]
);

export const getTags = cached(
  async (locale: string): Promise<Tag[]> => {
    const rows = orThrow(
      'getTags',
      await supabasePublic
        .from('tags')
        .select('key, tag_translations(locale, slug, name)')
        .order('sort_order')
    );

    return rows.flatMap((row) => {
      const t = pick(row.tag_translations, locale);
      return t ? [{ key: row.key, slug: t.slug, name: t.name }] : [];
    });
  },
  ['tags'],
  [TAGS.tags, TAGS.all]
);
