import { supabasePublic } from '@/lib/supabase/public';
import { cached } from './cache';
import { TAGS } from './tags';
import { localesFor, orThrow, pick } from './internal';
import type {
  CasePhase,
  CaseStudy,
  ProjectDetail,
  ProjectLinks,
  ProjectSummary,
  SlugMapEntry
} from './types';

/**
 * Projects and case studies.
 *
 * Slugs are translated, so `key` is the only thing that joins a project across
 * languages — it is what analytics events and OG filenames must use, never the
 * slug. A click on the ES page and on the EN page have to report as the same
 * project.
 */

function toLinks(value: unknown): ProjectLinks {
  return (value ?? {}) as ProjectLinks;
}

export const getProjects = cached(
  async (locale: string): Promise<ProjectSummary[]> => {
    const rows = orThrow(
      'getProjects',
      await supabasePublic
        .from('projects')
        .select(
          `key, category, techs, links, og_image,
           project_translations(locale, slug, title, description, noindex)`
        )
        .eq('status', 'published')
        .in('project_translations.locale', localesFor(locale))
        .order('sort_order')
    );

    return rows.flatMap((row) => {
      const t = pick(row.project_translations, locale);
      if (!t) return [];
      return [
        {
          key: row.key,
          slug: t.slug,
          category: row.category,
          techs: row.techs,
          links: toLinks(row.links),
          ogImage: row.og_image,
          title: t.title,
          description: t.description,
          noindex: t.noindex
        }
      ];
    });
  },
  ['projects'],
  [TAGS.projects, TAGS.all]
);

/**
 * One project, resolved by the slug **of that locale**.
 *
 * `!inner` is load-bearing: filtering an embedded resource without it returns
 * every parent row carrying only the matching children, so the project would
 * be found no matter which slug was asked for.
 */
export const getProject = cached(
  async (slug: string, locale: string): Promise<ProjectDetail | null> => {
    const { data, error } = await supabasePublic
      .from('projects')
      .select(
`key, category, techs, links, og_image,
         project_translations!inner(locale, slug, title, description, seo_title, seo_description, noindex),
         project_images(storage_path, width, height, blur_data_url, sort_order,
                        project_image_translations(locale, alt)),
         case_studies(
           case_study_translations(locale, overview, role, duration, team, context, problem,
                                   process_desc, results, learnings, note_html, note_url, note_link_text),
           case_study_phases(slug, sort_order,
                             case_study_phase_translations(locale, label, title, body)),
           case_study_metrics(sort_order, case_study_metric_translations(locale, text))
         )`
      )
      .eq('status', 'published')
      .eq('project_translations.slug', slug)
      .eq('project_translations.locale', locale)
      .maybeSingle();

    if (error) throw new Error(`content/getProject: ${error.message}`);
    if (!data) return null;

    const t = data.project_translations[0];
    if (!t) return null;

    const images = [...data.project_images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        storagePath: img.storage_path,
        width: img.width,
        height: img.height,
        blurDataUrl: img.blur_data_url,
        alt: pick(img.project_image_translations, locale)?.alt ?? null
      }));

    const cs = data.case_studies;
    let caseStudy: CaseStudy | null = null;

    if (cs) {
      const ct = pick(cs.case_study_translations, locale);
      const phases: CasePhase[] = [...cs.case_study_phases]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((p) => {
          const pt = pick(p.case_study_phase_translations, locale);
          return {
            slug: p.slug,
            label: pt?.label ?? null,
            title: pt?.title ?? null,
            body: pt?.body ?? null
          };
        });
      const metrics = [...cs.case_study_metrics]
        .sort((a, b) => a.sort_order - b.sort_order)
        .flatMap((m) => {
          const mt = pick(m.case_study_metric_translations, locale);
          return mt ? [mt.text] : [];
        });

      caseStudy = {
        overview: ct?.overview ?? null,
        role: ct?.role ?? null,
        duration: ct?.duration ?? null,
        team: ct?.team ?? null,
        context: ct?.context ?? null,
        problem: ct?.problem ?? null,
        processDesc: ct?.process_desc ?? null,
        results: ct?.results ?? null,
        learnings: ct?.learnings ?? null,
        noteHtml: ct?.note_html ?? null,
        noteUrl: ct?.note_url ?? null,
        noteLinkText: ct?.note_link_text ?? null,
        phases,
        metrics
      };
    }

    return {
      key: data.key,
      slug: t.slug,
      category: data.category,
      techs: data.techs,
      links: toLinks(data.links),
      ogImage: data.og_image,
      title: t.title,
      description: t.description,
      seoTitle: t.seo_title,
      seoDescription: t.seo_description,
      noindex: t.noindex,
      images,
      caseStudy
    };
  },
  ['project'],
  [TAGS.projects, TAGS.all]
);

/**
 * Every project's slug in every locale, in one query.
 *
 * This replaces `getProjectSlugs()`, which cannot work once slugs are
 * translated: knowing only the ES slug says nothing about the EN one, and
 * without the pair there is no hreflang cluster. Feeds `generateStaticParams`,
 * the sitemap's alternates, and each page's canonical + hreflang.
 */
export const getProjectSlugMap = cached(
  async (): Promise<SlugMapEntry[]> => {
    const rows = orThrow(
      'getProjectSlugMap',
      await supabasePublic
        .from('projects')
        .select('key, project_translations(locale, slug)')
        .eq('status', 'published')
        .order('sort_order')
    );

    return rows.map((row) => ({
      key: row.key,
      slugs: Object.fromEntries(row.project_translations.map((t) => [t.locale, t.slug]))
    }));
  },
  ['project-slug-map'],
  [TAGS.projects, TAGS.all]
);

/**
 * The slug a renamed one now points at, or null.
 *
 * NOT cached on purpose: it only ever runs where the page was already heading
 * for a 404, so caching would buy nothing and a cached miss could later serve
 * a stale answer for a redirect that has since changed.
 *
 * The caller must redirect with `permanentRedirect` from `@/i18n/routing` — not
 * `redirect`, which emits 307. Google reads 307 as temporary, keeps the old URL
 * indexed and transfers no ranking, which is exactly the damage the redirect
 * history exists to prevent. And `dynamicParams` must stay true on the page, or
 * Next answers 404 without ever running the component and none of this fires.
 */
export async function getRedirectedSlug(
  entityType: 'project' | 'post' | 'tag',
  locale: string,
  slug: string
): Promise<string | null> {
  const { data, error } = await supabasePublic
    .from('slug_redirects')
    .select('to_slug')
    .eq('entity_type', entityType)
    .eq('locale', locale)
    .eq('from_slug', slug)
    .maybeSingle();

  if (error) throw new Error(`content/getRedirectedSlug: ${error.message}`);
  return data?.to_slug ?? null;
}
