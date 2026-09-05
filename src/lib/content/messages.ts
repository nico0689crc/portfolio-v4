import { supabasePublic } from '@/lib/supabase/public';
import { cachedPerLocale } from './cache';
import { TAGS } from './tags';
import { localesFor, orThrow, pick } from './internal';
import { getCertifications, getEducation, getExperiences, getFaqs, getResumeHighlights } from './resume';

/**
 * Assembles the next-intl message tree from the database.
 *
 * This is the single integration point that turns the whole site DB-driven:
 * `src/i18n/request.ts` stops importing `messages/<locale>.json` and calls this
 * instead, and no component changes — `t()`, `t.raw()` and `getMessages()` keep
 * working exactly as before.
 *
 * Two sources are merged: the flat `ui_message_keys` / `ui_messages` rows
 * unflattened back into a nested object, and the entity tables projected into
 * the array-shaped nodes that components read with `t.raw()`.
 *
 * WHAT IS DELIBERATELY ABSENT, and why the swap is not a drop-in for
 * everything:
 *
 *   Portfolio.projects.N.*      Projects are addressed by `key` in the database
 *   Portfolio.case.<project>.*  and their per-locale slugs; the "N" index only
 *                               existed in the JSON. Those consumers move to
 *                               `getProjects()` / `getProject()`.
 *   Metadata.<page>Title/…      Replaced by `getPageSeo(routeKey, locale)`.
 *
 * So wiring this into `request.ts` must happen together with moving the
 * portfolio page, the project page and their `generateMetadata` onto the data
 * layer. Doing the swap alone would leave those three reading keys that the
 * tree no longer carries.
 */

type Tree = { [key: string]: string | Tree | unknown[] };

/** `'Contact.form.send'` -> nested objects, mutating `tree` in place. */
function place(tree: Tree, path: string, value: string): void {
  const parts = path.split('.');
  let node = tree;
  for (const part of parts.slice(0, -1)) {
    if (typeof node[part] !== 'object' || node[part] === null || Array.isArray(node[part])) {
      node[part] = {};
    }
    node = node[part] as Tree;
  }
  node[parts[parts.length - 1]] = value;
}

function setPath(tree: Tree, path: string, value: unknown[]): void {
  const parts = path.split('.');
  let node = tree;
  for (const part of parts.slice(0, -1)) {
    if (typeof node[part] !== 'object' || node[part] === null || Array.isArray(node[part])) {
      node[part] = {};
    }
    node = node[part] as Tree;
  }
  node[parts[parts.length - 1]] = value;
}

const getUiStrings = cachedPerLocale(
  async (locale: string): Promise<Tree> => {
    const rows = orThrow(
      'getUiStrings',
      await supabasePublic.from('ui_messages').select('key, locale, value').in('locale', localesFor(locale))
    );

    // Group by key so a missing translation degrades to the default locale
    // rather than rendering an empty string.
    const byKey = new Map<string, Array<{ locale: string; value: string }>>();
    for (const row of rows) {
      const list = byKey.get(row.key) ?? [];
      list.push({ locale: row.locale, value: row.value });
      byKey.set(row.key, list);
    }

    const tree: Tree = {};
    for (const [key, values] of byKey) {
      const chosen = pick(values, locale);
      if (chosen) place(tree, key, chosen.value);
    }
    return tree;
  },
  ['ui-strings'],
  (locale) => [TAGS.messages(locale), TAGS.all]
);

export const getMessageTree = cachedPerLocale(
  async (locale: string): Promise<Record<string, unknown>> => {
    const [tree, experiences, faqs, highlights, education, certifications] = await Promise.all([
      getUiStrings(locale),
      getExperiences(locale),
      getFaqs(locale),
      getResumeHighlights(locale),
      getEducation(locale),
      getCertifications(locale)
    ]);

    // Shapes match what the components already destructure, so `t.raw()` calls
    // keep working untouched.
    setPath(
      tree,
      'About.experience.jobs',
      experiences.map((e) => ({
        role: e.role,
        company: e.company,
        date: e.dateLabel,
        desc: e.description,
        tech: e.techs.join(', ')
      }))
    );
    setPath(tree, 'About.faq.questions', faqs.map((f) => ({ q: f.question, a: f.answer })));
    setPath(tree, 'Resume.highlights', highlights.map((h) => ({ label: h.label, value: h.value })));
    setPath(tree, 'Resume.education', education.map((e) => ({ degree: e.degree, status: e.dateLabel })));
    setPath(tree, 'Resume.certifications', certifications.map((c) => ({ name: c.name })));

    return tree;
  },
  ['message-tree'],
  (locale) => [TAGS.messages(locale), TAGS.all]
);
