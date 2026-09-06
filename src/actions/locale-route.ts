'use server';

import { getPostSlugMap, getProjectSlugMap } from '@/lib/content';
import { LOCALES, type Locale } from '@/i18n/locales';

/**
 * Rutas cuyo segmento dinámico está traducido.
 *
 * En el resto del sitio cambiar de idioma es sólo cambiar el prefijo, pero un
 * artículo y un caso tienen un slug distinto por idioma: navegar al otro idioma
 * con el slug de este da 404. El mapa de slugs vive en la base, así que la
 * equivalencia se resuelve acá y no en el cliente.
 *
 * `fallback` es a dónde va el visitante cuando la traducción no existe —o
 * todavía no está publicada—: el listado del idioma pedido, que es la respuesta
 * honesta y evita mandarlo a un 404.
 */
const TRANSLATED_ROUTES = {
  '/blog/[slug]': { slugMap: getPostSlugMap, fallback: '/blog' },
  '/projects/[slug]': { slugMap: getProjectSlugMap, fallback: '/portfolio' }
} as const;

type TranslatedRoute = keyof typeof TRANSLATED_ROUTES;

/** Un `href` de next-intl, ya serializable para cruzar la frontera del server. */
export interface AlternateRoute {
  pathname: string;
  params?: { slug: string };
}

function isTranslatedRoute(route: string): route is TranslatedRoute {
  return route in TRANSLATED_ROUTES;
}

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * El equivalente de una ruta con slug traducido en otro idioma.
 *
 * Devuelve `null` cuando la ruta no tiene slug traducido: en ese caso el
 * llamador ya puede navegar con los params que tiene.
 *
 * Es un server action, o sea un endpoint público: los argumentos se validan
 * contra las rutas y los idiomas conocidos antes de tocar nada.
 */
export async function alternateLocaleRoute({
  route,
  slug,
  fromLocale,
  toLocale
}: {
  route: string;
  slug: string;
  fromLocale: string;
  toLocale: string;
}): Promise<AlternateRoute | null> {
  if (!isTranslatedRoute(route) || !isLocale(fromLocale) || !isLocale(toLocale)) {
    return null;
  }

  const { slugMap, fallback } = TRANSLATED_ROUTES[route];
  const entry = (await slugMap()).find((candidate) => candidate.slugs[fromLocale] === slug);
  const translated = entry?.slugs[toLocale];

  return translated ? { pathname: route, params: { slug: translated } } : { pathname: fallback };
}
