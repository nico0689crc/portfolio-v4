import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPageSeo } from '@/lib/content';
import { buildPageMetadata, type LocalizedHref } from '@/lib/seo';

/**
 * Metadata de una página fija, con el título y la descripción que edita el
 * backoffice.
 *
 * El fallback no es decorativo. `page_seo` puede no tener la fila —una ruta
 * nueva que nadie cargó todavía— y una página que shippea con `<title>` vacío
 * es peor que una con un título genérico: Google la indexa igual y muestra lo
 * que le parece.
 *
 * El canonical y los hreflang siguen saliendo de `routing`, nunca de la base:
 * un canonical editable a mano es como una página en un idioma termina
 * apuntando a la URL de otro y desindexándose sola.
 */
export async function pageMetadata({
  locale,
  routeKey,
  href,
  type = 'website',
  fallbackImage = '/og/default.png'
}: {
  locale: string;
  routeKey: string;
  href: LocalizedHref;
  type?: 'website' | 'profile' | 'article';
  fallbackImage?: string;
}): Promise<Metadata> {
  const [seo, t] = await Promise.all([
    getPageSeo(routeKey, locale),
    getTranslations({ locale, namespace: 'Metadata' })
  ]);

  return buildPageMetadata({
    locale,
    href,
    title: seo?.title ?? t('defaultTitle'),
    description: seo?.description ?? t('defaultDescription'),
    image: seo?.ogImage ?? fallbackImage,
    type,
    noindex: seo?.noindex ?? false
  });
}
