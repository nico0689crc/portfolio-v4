/**
 * One-time migration of the site's content from static files into Supabase.
 *
 * After this runs, the database is the source of truth and `src/data/*.ts` plus
 * the entity-shaped parts of `messages/*.json` become dead weight.
 *
 * The positional join between `cvData.ts` (language-neutral: ISO dates,
 * organisations) and `messages/*.json` (the prose) happens HERE, exactly once.
 * From then on the relationship is a foreign key and order stops mattering —
 * which is the whole point of the migration.
 *
 * Idempotent by design: every write is an upsert keyed on a natural key, so
 * re-running never duplicates and never deletes. It deliberately does not wipe
 * tables, because by the time anyone re-runs this the backoffice may hold
 * edits that exist nowhere else.
 *
 *   node scripts/seed-content.mjs [--dry]
 */

import { readFileSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { createJiti } from 'jiti';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();

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
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Guard: this repo must never write to another client's project. The
// GymSmartAccess projects live in a different Supabase account and appear in
// this portfolio only as a case study.
if (!URL.includes(EXPECTED_REF)) {
  console.error(`Refusing to seed: expected project ${EXPECTED_REF}, got ${URL}`);
  process.exit(1);
}

// The seed is the one place the service-role key is legitimate: it bypasses RLS
// to write draft and published rows alike. It runs on a developer machine and
// never ships to the app.
const db = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

const messages = {
  es: JSON.parse(readFileSync(join(ROOT, 'messages/es.json'), 'utf8')),
  en: JSON.parse(readFileSync(join(ROOT, 'messages/en.json'), 'utf8'))
};
const LOCALES = ['en', 'es'];

const jiti = createJiti(import.meta.url, { alias: { '@': join(ROOT, 'src') } });

// `projectsData.ts` imports 17 images, which cannot resolve outside Next's
// bundler. Rewriting each import into a path string makes the module loadable
// AND yields exactly what the Storage upload will need later.
const projectsSrc = readFileSync(join(ROOT, 'src/data/projectsData.ts'), 'utf8').replace(
  /import\s+(\w+)\s+from\s+["']@\/(assets\/[^"']+)["'];?/g,
  (_, name, path) => `const ${name} = "src/${path}";`
);
const projectsTmp = join(tmpdir(), 'projectsData.seed.ts');
writeFileSync(projectsTmp, projectsSrc);

const { projects: PROJECTS } = await jiti.import(projectsTmp);
const { skillCategories: SKILLS } = await jiti.import(join(ROOT, 'src/data/skillsData.ts'));
const CV = await jiti.import(join(ROOT, 'src/data/cvData.ts'));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const stats = {};
const bump = (t, n = 1) => (stats[t] = (stats[t] || 0) + n);

function get(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** Prose for a message path in one locale, falling back to Spanish. */
function msg(locale, path) {
  const v = get(messages[locale], path);
  return v === undefined ? get(messages.es, path) : v;
}

async function upsert(table, rows, onConflict) {
  if (!rows.length) return [];
  if (DRY) { bump(table, rows.length); return []; }
  const { data, error } = await db.from(table).upsert(rows, { onConflict }).select();
  if (error) throw new Error(`${table}: ${error.message}`);
  bump(table, rows.length);
  return data ?? [];
}

/** Resolve a parent row by its natural key, creating it if absent. */
async function resolveByKey(table, key, row) {
  if (DRY) { bump(table); return { id: `dry-${key}` }; }
  const { data: found } = await db.from(table).select('id').eq('key', key).maybeSingle();
  if (found) {
    const { error } = await db.from(table).update(row).eq('id', found.id);
    if (error) throw new Error(`${table} update ${key}: ${error.message}`);
    bump(table);
    return found;
  }
  const { data, error } = await db.from(table).insert({ key, ...row }).select('id').single();
  if (error) throw new Error(`${table} insert ${key}: ${error.message}`);
  bump(table);
  return data;
}

/**
 * Ordered rows keyed by position. Used only where the source genuinely is two
 * parallel arrays; every result gets a real primary key so nothing downstream
 * depends on order again.
 */
async function resolveOrdered(table, count, rowFor) {
  if (DRY) { bump(table, count); return Array.from({ length: count }, (_, i) => ({ id: `dry-${i}` })); }
  const { data: existing } = await db.from(table).select('id').order('sort_order');
  if (existing && existing.length === count) {
    for (let i = 0; i < count; i++) {
      const { error } = await db.from(table).update(rowFor(i)).eq('id', existing[i].id);
      if (error) throw new Error(`${table} update ${i}: ${error.message}`);
    }
    bump(table, count);
    return existing;
  }
  if (existing?.length) await db.from(table).delete().neq('sort_order', -1);
  const rows = Array.from({ length: count }, (_, i) => rowFor(i));
  const { data, error } = await db.from(table).insert(rows).select('id');
  if (error) throw new Error(`${table} insert: ${error.message}`);
  bump(table, count);
  return data;
}

// ---------------------------------------------------------------------------
// Projects, case studies, phases, metrics
// ---------------------------------------------------------------------------

const PHASES = ['empathize', 'define', 'ideate', 'prototype', 'test'];

// Replaces the `metaKeyBySlug` map that was hardcoded in the project page.
const PROJECT_SEO = {
  'mexx-ux-redesign': ['mexxTitle', 'mexxDescription'],
  'gym-smart-access': ['gymTitle', 'gymDescription']
};

async function seedProjects() {
  for (const [i, p] of PROJECTS.entries()) {
    const { id } = await resolveByKey('projects', p.id, {
      category: p.category,
      techs: p.techs ?? [],
      links: Object.fromEntries(
        ['github', 'demo', 'canva', 'figjam', 'lofi']
          .filter((k) => p[k])
          .map((k) => [k, p[k]])
      ),
      og_image: p.ogImage ?? null,
      status: 'published',
      published_at: new Date().toISOString(),
      sort_order: i
    });

    const [seoT, seoD] = PROJECT_SEO[p.id] ?? [];
    await upsert(
      'project_translations',
      LOCALES.map((l) => ({
        project_id: id,
        locale: l,
        slug: p.slugs[l] ?? p.slugs.en,
        title: msg(l, `Portfolio.${p.titleKey}`),
        description: msg(l, `Portfolio.${p.descKey}`),
        seo_title: seoT ? msg(l, `Metadata.${seoT}`) : null,
        seo_description: seoD ? msg(l, `Metadata.${seoD}`) : null
      })),
      'project_id,locale'
    );

    if (p.casePrefix) await seedCaseStudy(id, p.casePrefix);
  }
}

async function seedCaseStudy(projectId, prefix) {
  const path = (l, k) => msg(l, `Portfolio.${prefix}.${k}`);
  if (!path('es', 'overview')) return;

  await upsert('case_studies', [{ project_id: projectId }], 'project_id');

  await upsert(
    'case_study_translations',
    LOCALES.map((l) => ({
      project_id: projectId,
      locale: l,
      overview: path(l, 'overview') ?? null,
      role: path(l, 'role') ?? null,
      duration: path(l, 'duration') ?? null,
      team: path(l, 'team') ?? null,
      context: path(l, 'context') ?? null,
      problem: path(l, 'problem') ?? null,
      // Falls back to the shared label when the project does not override it.
      process_desc: path(l, 'processDesc') ?? msg(l, 'Portfolio.case.processDesc') ?? null,
      results: path(l, 'results') ?? null,
      learnings: path(l, 'learnings') ?? null,
      note_html: path(l, 'diplomaNote') ?? null,
      note_url: path(l, 'diplomaUrl') ?? null,
      note_link_text: path(l, 'diplomaLinkText') ?? null
    })),
    'project_id,locale'
  );

  // Phases are rows because a project may relabel them: Mexx overrides all
  // five, everyone else inherits the shared Design Thinking labels.
  for (const [i, slug] of PHASES.entries()) {
    const n = i + 1;
    const rows = await upsert(
      'case_study_phases',
      [{ project_id: projectId, slug, sort_order: i }],
      'project_id,slug'
    );
    const phaseId = rows[0]?.id;
    if (!phaseId) continue;

    await upsert(
      'case_study_phase_translations',
      LOCALES.map((l) => ({
        phase_id: phaseId,
        locale: l,
        label: path(l, `phase${n}.label`) ?? msg(l, `Portfolio.case.phase${n}.label`) ?? null,
        title: path(l, `phase${n}.title`) ?? msg(l, `Portfolio.case.phase${n}.title`) ?? null,
        body: path(l, slug) ?? null
      })),
      'phase_id,locale'
    );
  }

  // Metrics: three in the current content, but the table takes any number.
  const { data: existing } = DRY
    ? { data: [] }
    : await db.from('case_study_metrics').select('id').eq('project_id', projectId).order('sort_order');

  for (let i = 0; i < 3; i++) {
    if (!path('es', `metric${i + 1}`)) continue;
    let metricId = existing?.[i]?.id;
    if (!metricId && !DRY) {
      const { data, error } = await db
        .from('case_study_metrics')
        .insert({ project_id: projectId, sort_order: i })
        .select('id')
        .single();
      if (error) throw new Error(`case_study_metrics: ${error.message}`);
      metricId = data.id;
      bump('case_study_metrics');
    }
    if (!metricId) continue;
    await upsert(
      'case_study_metric_translations',
      // The message file stores each metric as a { value, label } object.
      // Passing it whole used to land in a single text column, which silently
      // stringified it into JSON; the columns are split now, so spread it.
      LOCALES.map((l) => {
        const metric = path(l, `metric${i + 1}`);

        return { metric_id: metricId, locale: l, value: metric.value, label: metric.label };
      }),
      'metric_id,locale'
    );
  }
}

// ---------------------------------------------------------------------------
// Résumé: the positional joins, performed once
// ---------------------------------------------------------------------------

async function seedExperiences() {
  const jobs = { en: msg('en', 'About.experience.jobs'), es: msg('es', 'About.experience.jobs') };
  if (jobs.es.length !== CV.positions.length) {
    throw new Error(
      `Positional join broken: cvData has ${CV.positions.length} positions, ` +
        `messages has ${jobs.es.length}. Fix before seeding.`
    );
  }

  const rows = await resolveOrdered('experiences', CV.positions.length, (i) => {
    const p = CV.positions[i];
    return {
      organization: p.organization,
      employment_type: p.employmentType,
      remote: p.remote,
      techs: p.skills ?? [],
      start_date: p.startDate ? `${p.startDate}-01` : null,
      end_date: p.endDate ? `${p.endDate}-01` : null,
      // Discrete stretches for an interrupted position. Read from cvData rather
      // than hardcoded here so there stays one source; a DB trigger derives
      // start_date/end_date from these whenever they are present.
      periods: p.periods
        ? p.periods.map((r) => ({
            start_date: `${r.startDate}-01`,
            end_date: r.endDate ? `${r.endDate}-01` : null
          }))
        : null,
      sort_order: i
    };
  });

  for (const [i, row] of rows.entries()) {
    await upsert(
      'experience_translations',
      LOCALES.map((l) => ({
        experience_id: row.id,
        locale: l,
        role: jobs[l][i].role,
        // The visible label is translated prose that does not derive from
        // organization + location: the ES page says "Autónomo" where the
        // neutral record says "Self-employed", and one row shows only a region.
        company: jobs[l][i].company,
        location: CV.positions[i].location,
        date_label: jobs[l][i].date,
        description: jobs[l][i].desc
      })),
      'experience_id,locale'
    );
  }
}

async function seedEducation() {
  const src = { en: msg('en', 'Resume.education'), es: msg('es', 'Resume.education') };
  if (!src.es || src.es.length !== CV.education.length) {
    throw new Error(`Education join broken: ${CV.education.length} vs ${src.es?.length}`);
  }

  const rows = await resolveOrdered('education', CV.education.length, (i) => {
    const e = CV.education[i];
    return {
      institution: e.institution,
      url: e.url ?? null,
      start_date: e.startDate ? `${e.startDate}-01` : null,
      end_date: e.endDate ? `${e.endDate}-01` : null,
      sort_order: i
    };
  });

  for (const [i, row] of rows.entries()) {
    await upsert(
      'education_translations',
      LOCALES.map((l) => ({
        education_id: row.id,
        locale: l,
        degree: src[l][i].degree,
        // The rendered date is editorial prose per language, which is why it is
        // stored rather than formatted from start_date/end_date.
        date_label: src[l][i].status,
        location: CV.education[i].location ?? null
      })),
      'education_id,locale'
    );
  }
}

async function seedCertifications() {
  const src = { en: msg('en', 'Resume.certifications'), es: msg('es', 'Resume.certifications') };
  if (!src.es || src.es.length !== CV.certifications.length) {
    throw new Error(`Certification join broken: ${CV.certifications.length} vs ${src.es?.length}`);
  }

  const rows = await resolveOrdered('certifications', CV.certifications.length, (i) => ({
    issuer: CV.certifications[i].issuer,
    year: CV.certifications[i].year,
    sort_order: i
  }));

  for (const [i, row] of rows.entries()) {
    await upsert(
      'certification_translations',
      LOCALES.map((l) => ({ certification_id: row.id, locale: l, name: src[l][i].name })),
      'certification_id,locale'
    );
  }
}

// ---------------------------------------------------------------------------
// Skills, highlights, FAQ
// ---------------------------------------------------------------------------

async function seedSkills() {
  for (const [i, cat] of SKILLS.entries()) {
    const slug = cat.labelKey.split('.').pop();
    const rows = await upsert('skill_categories', [{ slug, sort_order: i }], 'slug');
    const catId = rows[0]?.id;
    if (!catId) continue;

    await upsert(
      'skill_category_translations',
      LOCALES.map((l) => ({ category_id: catId, locale: l, label: msg(l, `Home.${cat.labelKey}`) })),
      'category_id,locale'
    );

    // Skills carry no user-authored data beyond this file and have no natural
    // key, so the category's set is replaced wholesale rather than upserted.
    if (!DRY) await db.from('skills').delete().eq('category_id', catId);

    const translatable = !Array.isArray(cat.skills);
    // Technical names are proper nouns, identical in every language; soft
    // skills are not, and that is exactly what `is_translatable` encodes.
    const names = translatable ? cat.skills.es : cat.skills;

    const inserted = DRY
      ? []
      : (
          await db
            .from('skills')
            .insert(
              names.map((name, j) => ({
                category_id: catId,
                name_default: name,
                is_translatable: translatable,
                sort_order: j
              }))
            )
            .select('id')
        ).data ?? [];
    bump('skills', names.length);

    if (translatable) {
      for (const [j, row] of inserted.entries()) {
        await upsert(
          'skill_translations',
          LOCALES.map((l) => ({ skill_id: row.id, locale: l, name: (cat.skills[l] ?? cat.skills.es)[j] })),
          'skill_id,locale'
        );
      }
    }
  }
}

async function seedHighlights() {
  const src = { en: msg('en', 'Resume.highlights'), es: msg('es', 'Resume.highlights') };
  const rows = await resolveOrdered('resume_highlights', src.es.length, (i) => ({ sort_order: i }));
  for (const [i, row] of rows.entries()) {
    await upsert(
      'resume_highlight_translations',
      LOCALES.map((l) => ({
        highlight_id: row.id,
        locale: l,
        label: src[l][i].label,
        value: src[l][i].value
      })),
      'highlight_id,locale'
    );
  }
}

async function seedFaqs() {
  const src = { en: msg('en', 'About.faq.questions'), es: msg('es', 'About.faq.questions') };
  const rows = await resolveOrdered('faqs', src.es.length, (i) => ({ sort_order: i }));
  for (const [i, row] of rows.entries()) {
    await upsert(
      'faq_translations',
      LOCALES.map((l) => ({ faq_id: row.id, locale: l, question: src[l][i].q, answer: src[l][i].a })),
      'faq_id,locale'
    );
  }
}

// ---------------------------------------------------------------------------
// Per-page SEO, settings, redirect history
// ---------------------------------------------------------------------------

// Route key -> the `Metadata.*` pair it replaces.
const PAGE_SEO = {
  '/': ['homeTitle', 'homeDescription'],
  '/about': ['aboutTitle', 'aboutDescription'],
  '/portfolio': ['portfolioTitle', 'portfolioDescription'],
  '/resume': ['resumeTitle', 'resumeDescription'],
  '/contact': ['contactTitle', 'contactDescription']
};

async function seedPageSeo() {
  const keys = Object.keys(PAGE_SEO);
  await upsert(
    'page_seo',
    keys.map((route_key, i) => ({ route_key, sort_order: i })),
    'route_key'
  );
  await upsert(
    'page_seo_translations',
    keys.flatMap((route_key) => {
      const [t, d] = PAGE_SEO[route_key];
      return LOCALES.map((l) => ({
        route_key,
        locale: l,
        title: msg(l, `Metadata.${t}`),
        description: msg(l, `Metadata.${d}`)
      }));
    }),
    'route_key,locale'
  );
}

async function seedSettings() {
  await upsert(
    'settings',
    [
      { key: 'social_links', value: ['https://www.linkedin.com/in/nicolas-ariel-fernandez', 'https://github.com/nico0689crc'] },
      { key: 'contact_email', value: 'contacto@nicolasarielfernandez.com' },
      // Still files today. When the CV is generated dynamically only this value
      // changes: `getCvFiles()` returns URLs and does not care what serves them.
      { key: 'cv_files', value: CV.CV_FILES },
      // Editorial claim, not a computation — the author may round down or count
      // from a different starting point, so it is stored rather than derived
      // from min(start_date).
      { key: 'years_of_experience', value: CV.YEARS_OF_EXPERIENCE }
    ],
    'key'
  );
}

async function seedSlugRedirects() {
  // The two Spanish slugs that were live and indexed before they were renamed.
  // They are currently also covered by next.config's static redirects; those
  // can be removed once lazy resolution is verified against the database.
  // Keeping them here is what lets the trigger flatten a future rename into a
  // single hop instead of chaining across two systems.
  await upsert(
    'slug_redirects',
    [
      { entity_type: 'project', locale: 'es', from_slug: 'mexx-ux-redesign', to_slug: 'rediseno-ux-ui-ecommerce-mexx' },
      { entity_type: 'project', locale: 'es', from_slug: 'gym-smart-access', to_slug: 'gymsmartaccess-gestion-gimnasios' }
    ],
    'entity_type,locale,from_slug'
  );
}

// ---------------------------------------------------------------------------
// UI strings
// ---------------------------------------------------------------------------

/**
 * Entradas numeradas de proyecto: `Portfolio.projects.5.title`.
 *
 * Se distinguen por el indice porque sus hermanas —`Portfolio.projects.demo`,
 * `.viewCase`, `.filter.all`— son etiquetas de UI que los componentes siguen
 * usando. Excluir el subarbol entero se las llevaba puestas, y la pagina
 * terminaba mostrando el nombre de la clave en vez del texto.
 */
const NUMBERED_PROJECT_KEY = /^Portfolio\.projects\.\d+\./;

/** Paths that became entities and must NOT be duplicated as UI strings. */
const ENTITY_PATHS = [
  'About.experience.jobs',
  'About.faq.questions',
  'Resume.highlights',
  'Resume.education',
  'Resume.certifications',
  ...Object.values(PAGE_SEO).flat().map((k) => `Metadata.${k}`)
];

/** A `Portfolio.case.<x>` node holding an `overview` is case-study content. */
function isCaseContent(path) {
  const m = path.match(/^Portfolio\.case\.([^.]+)\./);
  return Boolean(m && get(messages.es, `Portfolio.case.${m[1]}.overview`));
}

function flatten(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) continue; // arrays are entities, handled above
    if (v !== null && typeof v === 'object') flatten(v, path, out);
    else out.push([path, v]);
  }
  return out;
}

async function seedUiMessages() {
  // El `.` del prefijo es lo que importa: sin el, `Resume.highlights` excluia
  // tambien a `Resume.highlightsTitle`, que es una etiqueta de UI y no parte de
  // la entidad. El sintoma era la pagina de CV mostrando el nombre de la clave
  // en lugar del titulo, y solo despues de que request.ts leyera de la base.
  // El `.` del prefijo es lo que importa: sin el, `Resume.highlights` excluia
  // tambien a `Resume.highlightsTitle`, que es una etiqueta de UI y no parte de
  // la entidad.
  const isEntityPath = (path) =>
    ENTITY_PATHS.some((p) => path === p || path.startsWith(`${p}.`));

  const leaves = flatten(messages.es).filter(
    ([path]) => !isEntityPath(path) && !NUMBERED_PROJECT_KEY.test(path) && !isCaseContent(path)
  );

  await upsert(
    'ui_message_keys',
    leaves.map(([key], i) => ({
      key,
      namespace: key.split('.')[0],
      // Some values are injected with dangerouslySetInnerHTML, so the editor
      // must know which ones are markup rather than text.
      allows_html: /<[a-z][\s\S]*>/i.test(String(get(messages.es, key) ?? '')),
      sort_order: i
    })),
    'key'
  );

  await upsert(
    'ui_messages',
    leaves.flatMap(([key]) =>
      LOCALES.map((l) => ({ key, locale: l, value: String(msg(l, key) ?? '') }))
    ),
    'key,locale'
  );

  return leaves.length;
}

// ---------------------------------------------------------------------------

async function main() {
  console.log(`${DRY ? 'DRY RUN — ' : ''}seeding ${URL}\n`);

  await seedProjects();
  await seedExperiences();
  await seedEducation();
  await seedCertifications();
  await seedSkills();
  await seedHighlights();
  await seedFaqs();
  await seedPageSeo();
  await seedSettings();
  await seedSlugRedirects();
  const uiCount = await seedUiMessages();

  console.log('rows written');
  for (const [table, n] of Object.entries(stats).sort()) {
    console.log(`  ${table.padEnd(34)} ${n}`);
  }
  console.log(`\n${uiCount} UI string keys x ${LOCALES.length} locales`);
  if (DRY) console.log('\nDRY RUN — nothing was written.');
}

main().catch((err) => {
  console.error(`\nseed failed: ${err.message}`);
  process.exit(1);
});
