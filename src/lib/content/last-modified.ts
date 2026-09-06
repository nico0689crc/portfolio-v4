import { supabasePublic } from '@/lib/supabase/public';
import { cached } from './cache';
import { TAGS } from './tags';

/**
 * Cuándo cambió de verdad el contenido de cada ruta.
 *
 * El sitemap declaraba la hora del build para las dieciséis URLs. Google ignora
 * un `lastmod` que reconoce como fecha de compilación, así que esa señal —la
 * que le dice "esto cambió, volvé a mirarlo"— se estaba desperdiciando.
 *
 * Cada ruta toma el máximo de lo que realmente la compone. Es deliberadamente
 * grueso para las páginas fijas: `/resume` cambia si cambia cualquier
 * experiencia, y afinar más significaría rastrear qué tabla alimenta qué
 * párrafo, que es precisión que nadie usa a cambio de un mapeo que se rompe con
 * el próximo campo.
 */
export type RouteTimestamps = {
  /** Ruta interna (`/portfolio`, no `/es/portafolio`) → ISO. */
  pages: Record<string, string>;
  /** Clave de proyecto → ISO. */
  projects: Record<string, string>;
  /** Clave de post → ISO. */
  posts: Record<string, string>;
  /** El más reciente de todo, para lo que no tiene fecha propia. */
  latest: string;
};

const maxIso = (values: Array<string | null | undefined>): string | null => {
  const valid = values.filter((v): v is string => Boolean(v));

  return valid.length > 0 ? valid.reduce((a, b) => (a > b ? a : b)) : null;
};

export const getRouteTimestamps = cached(
  async (): Promise<RouteTimestamps> => {
    const [pageSeo, projects, posts, experiences, settings] = await Promise.all([
      supabasePublic.from('page_seo_translations').select('route_key, updated_at'),
      supabasePublic
        .from('projects')
        .select('key, updated_at, project_translations(updated_at), case_studies(updated_at)'),
      supabasePublic.from('post_translations').select('slug, updated_at, posts!inner(key)'),
      supabasePublic.from('experiences').select('updated_at'),
      supabasePublic.from('settings').select('updated_at')
    ]);

    const fallback = new Date().toISOString();

    const seoByRoute: Record<string, string> = {};

    for (const row of pageSeo.data ?? []) {
      const current = seoByRoute[row.route_key];

      if (!current || row.updated_at > current) seoByRoute[row.route_key] = row.updated_at;
    }

    const projectRows = projects.data ?? [];
    const projectStamps: Record<string, string> = {};

    for (const row of projectRows) {
      const stamp = maxIso([
        row.updated_at,
        ...row.project_translations.map((t) => t.updated_at),
        row.case_studies?.updated_at
      ]);

      if (stamp) projectStamps[row.key] = stamp;
    }

    const postStamps: Record<string, string> = {};

    for (const row of posts.data ?? []) {
      const key = row.posts.key;
      const current = postStamps[key];

      if (!current || row.updated_at > current) postStamps[key] = row.updated_at;
    }

    const experiencesMax = maxIso((experiences.data ?? []).map((r) => r.updated_at));
    const settingsMax = maxIso((settings.data ?? []).map((r) => r.updated_at));
    const projectsMax = maxIso(Object.values(projectStamps));
    const postsMax = maxIso(Object.values(postStamps));

    // El listado de proyectos cambia cuando cambia cualquier proyecto, y el CV
    // cuando cambia cualquier experiencia o los archivos de los ajustes.
    const pages: Record<string, string> = {
      '/': maxIso([seoByRoute['/'], experiencesMax, settingsMax]) ?? fallback,
      '/about': maxIso([seoByRoute['/about'], experiencesMax]) ?? fallback,
      '/portfolio': maxIso([seoByRoute['/portfolio'], projectsMax]) ?? fallback,
      '/resume': maxIso([seoByRoute['/resume'], experiencesMax, settingsMax]) ?? fallback,
      '/contact': seoByRoute['/contact'] ?? fallback,
      '/blog': maxIso([seoByRoute['/blog'], postsMax]) ?? fallback
    };

    return {
      pages,
      projects: projectStamps,
      posts: postStamps,
      latest: maxIso([...Object.values(pages), projectsMax, postsMax]) ?? fallback
    };
  },
  ['route-timestamps'],
  [TAGS.all]
);
