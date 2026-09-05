/**
 * Moves project screenshots from the repo into Supabase Storage and records
 * them in `project_images`.
 *
 * This is the hinge for the public project pages. They still import images as
 * `StaticImageData` from `@/assets/projects`, which is what keeps them bound to
 * the static data file: an image that only exists as a bundler import cannot be
 * added or reordered from the backoffice. Until the bytes live in Storage and
 * the rows live in the database, switching those pages to the content layer
 * would mean shipping pages with no images.
 *
 *   node scripts/upload-project-images.mjs
 *
 * Idempotent: re-running overwrites the objects and rebuilds the rows.
 */

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXPECTED_REF = 'zqdtjbjybefomumkbwmd';
const BUCKET = 'project-images';

if (!URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

if (!URL.includes(EXPECTED_REF)) {
  console.error(`Refusing to run: expected project ${EXPECTED_REF}, got ${URL}`);
  process.exit(1);
}

/**
 * Order is the display order taken from `src/data/projectsData.ts`, not a
 * filename sort — mexx deliberately leads with 1, 6, 7 before the rest, and
 * sorting these alphabetically would silently reshuffle the carousel.
 * `gymsmartaccess/4.png` is absent from the repo, hence the gap.
 */
const PROJECTS = [
  {
    key: 'mexx-ux-redesign',
    files: [1, 6, 7, 2, 3, 4, 5].map((n) => `src/assets/projects/mexx/${n}.png`)
  },
  {
    key: 'gym-smart-access',
    files: [1, 2, 3, 5, 6, 7, 8, 9].map((n) => `src/assets/projects/gymsmartaccess/${n}.png`)
  }
];

const db = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });

/**
 * A 16px-wide JPEG inlined as a data URL. Static imports gave us this blur
 * placeholder for free; dropping it when the images move to Storage would be a
 * visible regression on slow connections, so it is regenerated here and stored
 * alongside the dimensions `next/image` needs to reserve layout space.
 */
async function blurDataUrl(buffer) {
  const tiny = await sharp(buffer).resize(16).jpeg({ quality: 40 }).toBuffer();

  return `data:image/jpeg;base64,${tiny.toString('base64')}`;
}

const { data: buckets } = await db.storage.listBuckets();

if (!buckets?.some((b) => b.name === BUCKET)) {
  // Public, because these are portfolio screenshots meant to be seen. A private
  // bucket would force a signed URL per render, which cannot be baked into a
  // statically generated page and would expire in any CDN cache.
  const { error } = await db.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: '10MB',
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/avif']
  });

  if (error) throw new Error(`createBucket: ${error.message}`);
  console.log(`bucket created: ${BUCKET}`);
} else {
  console.log(`bucket exists: ${BUCKET}`);
}

for (const project of PROJECTS) {
  const { data: row, error } = await db
    .from('projects')
    .select('id')
    .eq('key', project.key)
    .maybeSingle();

  if (error) throw new Error(`projects: ${error.message}`);
  if (!row) {
    console.warn(`  skipped ${project.key}: no such project`);
    continue;
  }

  // No unique constraint covers (project_id, storage_path), so idempotency is
  // a clean rebuild of this project's rows rather than an upsert.
  await db.from('project_images').delete().eq('project_id', row.id);

  const records = [];

  for (const [index, file] of project.files.entries()) {
    const buffer = readFileSync(file);
    const { width, height } = await sharp(buffer).metadata();
    const storagePath = `${project.key}/${basename(file)}`;

    const { error: uploadError } = await db.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: file.endsWith('.png') ? 'image/png' : 'image/jpeg',
      cacheControl: '31536000',
      upsert: true
    });

    if (uploadError) throw new Error(`upload ${storagePath}: ${uploadError.message}`);

    records.push({
      project_id: row.id,
      storage_path: storagePath,
      width,
      height,
      blur_data_url: await blurDataUrl(buffer),
      sort_order: index
    });
  }

  const { error: insertError } = await db.from('project_images').insert(records);

  if (insertError) throw new Error(`project_images: ${insertError.message}`);

  console.log(`  ${project.key}: ${records.length} images`);
}

console.log('\nDone. Public URL prefix:');
console.log(`  ${URL}/storage/v1/object/public/${BUCKET}/`);
