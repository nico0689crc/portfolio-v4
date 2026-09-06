/**
 * Carga los artículos del blog desde `content/posts/` hacia Supabase.
 *
 * Cada post es un directorio con un archivo por idioma:
 *
 *   content/posts/<key>/es.md
 *   content/posts/<key>/en.md
 *
 * Los campos compartidos entre idiomas —el prompt de portada y las etiquetas—
 * se leen del archivo en español, que es el canónico. Están en `posts` y en
 * `post_tags`, que no tienen columna de locale: escribirlos dos veces sólo
 * abriría la puerta a que los dos idiomas se contradigan.
 *
 * Todas las escrituras son upsert por clave natural (`key`, `post_id,locale`),
 * así que volver a correrlo no duplica ni borra. Lo que sí hace es pisar el
 * cuerpo del artículo con el del repo: si algo se editó desde el panel y no se
 * volcó al archivo, esa edición se pierde. El repo es la fuente de verdad de
 * los artículos, al revés que el resto del contenido del sitio.
 *
 *   node scripts/seed-posts.mjs [--dry] [--only <key>]
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const DRY = process.argv.includes('--dry');
const ONLY = (() => {
  const i = process.argv.indexOf('--only');
  return i !== -1 ? process.argv[i + 1] : null;
})();

const ROOT = process.cwd();
const POSTS_DIR = join(ROOT, 'content/posts');
const LOCALES = ['es', 'en'];

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

for (const line of readFileSync(join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXPECTED_REF = 'zqdtjbjybefomumkbwmd';

if (!URL || !SERVICE_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

// El mismo guard que el seed de contenido: este repo nunca escribe en el
// proyecto de otro cliente.
if (!URL.includes(EXPECTED_REF)) {
  console.error(`Me niego a escribir: esperaba el proyecto ${EXPECTED_REF} y recibí ${URL}`);
  process.exit(1);
}

const db = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

/**
 * Parser mínimo de frontmatter, suficiente para el formato que escribimos acá:
 * `clave: valor` de una línea, con comillas opcionales. No hay dependencia de
 * YAML en el proyecto y traer una para esto sería desproporcionado.
 *
 * El corte es en el PRIMER `:` y no en todos, porque los títulos llevan dos
 * puntos con total normalidad y partirlos ahí los truncaba a la mitad.
 */
function parseFrontmatter(raw, file) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) throw new Error(`${file}: falta el bloque de frontmatter`);

  const [, head, body] = match;
  const data = {};

  for (const line of head.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;

    const at = line.indexOf(':');

    if (at === -1) throw new Error(`${file}: línea de frontmatter sin ":" -> ${line}`);

    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();

    if (value.length > 1 && value[0] === value[value.length - 1] && (value[0] === '"' || value[0] === "'")) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }

  return { data, body: body.trim() };
}

/** `tags: ux-research, producto` -> ['ux-research', 'producto'] */
function parseList(value) {
  if (!value) return [];

  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Palabras del cuerpo, descontando la sintaxis de markdown.
 *
 * Importa que sea el texto limpio: contar los `##`, los `](url)` y las vallas
 * de código infla el número y con él los minutos de lectura, que es justamente
 * el dato que el lector usa para decidir si entra o no.
 */
function countWords(markdown) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[#>\-*+\s]+/gm, ' ')
    .replace(/[*_~]/g, ' ');

  return text.split(/\s+/).filter(Boolean).length;
}

// ---------------------------------------------------------------------------
// Escritura
// ---------------------------------------------------------------------------

const stats = { posts: 0, translations: 0, tags: 0, links: 0 };

async function resolveTag(key, names, sortOrder) {
  if (DRY) return `dry-${key}`;

  const { data: found } = await db.from('tags').select('id').eq('key', key).maybeSingle();
  let id = found?.id;

  if (!id) {
    const { data, error } = await db.from('tags').insert({ key, sort_order: sortOrder }).select('id').single();

    if (error) throw new Error(`tags ${key}: ${error.message}`);
    id = data.id;
  }

  const { error: tErr } = await db.from('tag_translations').upsert(
    LOCALES.map(locale => ({
      tag_id: id,
      locale,
      slug: names[locale].slug,
      name: names[locale].name
    })),
    { onConflict: 'tag_id,locale' }
  );

  if (tErr) throw new Error(`tag_translations ${key}: ${tErr.message}`);
  stats.tags += 1;

  return id;
}

async function seedTags(catalog) {
  const ids = {};
  let order = 0;

  for (const [key, names] of Object.entries(catalog)) {
    ids[key] = await resolveTag(key, names, order++);
  }

  return ids;
}

async function seedPost(key, tagIds) {
  const dir = join(POSTS_DIR, key);
  const parsed = {};

  for (const locale of LOCALES) {
    const file = join(dir, `${locale}.md`);

    if (!existsSync(file)) throw new Error(`${key}: falta ${locale}.md`);
    parsed[locale] = parseFrontmatter(readFileSync(file, 'utf8'), `${key}/${locale}.md`);
  }

  // Compartidos entre idiomas: se leen del español, que es el canónico.
  const shared = parsed.es.data;
  const postRow = { key, image_prompt: shared.imagePrompt ?? null };

  let postId = `dry-${key}`;

  if (!DRY) {
    const { data: found } = await db.from('posts').select('id').eq('key', key).maybeSingle();

    if (found) {
      const { error } = await db.from('posts').update(postRow).eq('id', found.id);

      if (error) throw new Error(`posts ${key}: ${error.message}`);
      postId = found.id;
    } else {
      const { data, error } = await db.from('posts').insert(postRow).select('id').single();

      if (error) throw new Error(`posts ${key}: ${error.message}`);
      postId = data.id;
    }
  }

  stats.posts += 1;

  const rows = LOCALES.map(locale => {
    const { data, body } = parsed[locale];
    const words = countWords(body);
    const published = data.status === 'published';

    return {
      post_id: postId,
      locale,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body,
      status: data.status ?? 'draft',
      // Una fecha de publicación en un borrador es lo que hace que el post
      // aparezca en el sitemap antes de existir. Sólo viaja si está publicado.
      published_at: published && data.publishedAt ? new Date(data.publishedAt).toISOString() : null,
      reading_minutes: Math.max(1, Math.round(words / 200)),
      word_count: words,
      focus_keyphrase: data.focusKeyphrase ?? null,
      seo_title: data.seoTitle ?? null,
      seo_description: data.seoDescription ?? null,
      og_title: data.ogTitle ?? null,
      og_description: data.ogDescription ?? null,
      cover_alt: data.coverAlt ?? null
    };
  });

  if (!DRY) {
    const { error } = await db.from('post_translations').upsert(rows, { onConflict: 'post_id,locale' });

    if (error) throw new Error(`post_translations ${key}: ${error.message}`);
  }

  stats.translations += rows.length;

  const tags = parseList(shared.tags);

  if (tags.length && !DRY) {
    const unknown = tags.filter(t => !tagIds[t]);

    if (unknown.length) throw new Error(`${key}: etiquetas fuera del catálogo -> ${unknown.join(', ')}`);

    const { error } = await db.from('post_tags').upsert(
      tags.map(t => ({ post_id: postId, tag_id: tagIds[t] })),
      { onConflict: 'post_id,tag_id' }
    );

    if (error) throw new Error(`post_tags ${key}: ${error.message}`);
  }

  stats.links += tags.length;

  const published = LOCALES.filter(l => parsed[l].data.status === 'published');

  return { key, published: published.join('+') || 'borrador', words: countWords(parsed.es.body) };
}

async function main() {
  if (!existsSync(POSTS_DIR)) {
    console.error(`No existe ${POSTS_DIR}`);
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(join(ROOT, 'content/tags.json'), 'utf8'));
  const keys = ONLY
    ? [ONLY]
    : readdirSync(POSTS_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort();

  console.log(`${DRY ? 'DRY RUN — ' : ''}cargando ${keys.length} posts — ${URL}\n`);

  const tagIds = await seedTags(catalog);

  for (const key of keys) {
    const result = await seedPost(key, tagIds);

    console.log(`  ${result.published.padEnd(9)} ${String(result.words).padStart(5)}w  ${result.key}`);
  }

  console.log(
    `\n${stats.posts} posts, ${stats.translations} traducciones, ${stats.tags} etiquetas, ${stats.links} vínculos.`
  );
  console.log('ninguna otra entidad tocada.');
}

await main();
