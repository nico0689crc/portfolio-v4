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
  fallbackImage = `/og/default-${locale}.png`,
  absoluteTitle = false
}: {
  locale: string;
  routeKey: string;
  href: LocalizedHref;
  type?: 'website' | 'profile' | 'article';
  fallbackImage?: string;
  /**
   * Emite el título tal cual, sin el sufijo del template.
   *
   * Lo necesita la home y sólo la home, por una regla poco conocida de Next:
   * `title.template` se aplica a los segmentos hijos, no a la página del mismo
   * segmento donde se define. `[locale]/page.tsx` convive con el layout que lo
   * declara, así que su título salía pelado mientras el resto del sitio recibía
   * el sufijo — y la portada es justo la página donde peor se nota.
   */
  absoluteTitle?: boolean;
}): Promise<Metadata> {
  const [seo, t] = await Promise.all([
    getPageSeo(routeKey, locale),
    getTranslations({ locale, namespace: 'Metadata' })
  ]);

  const title = seo?.title ?? t('defaultTitle');

  const metadata = buildPageMetadata({
    locale,
    href,
    title,
    description: seo?.description ?? t('defaultDescription'),
    image: seo?.ogImage ?? fallbackImage,
    type,
    noindex: seo?.noindex ?? false
  });

  return absoluteTitle ? { ...metadata, title: { absolute: title } } : metadata;
}
