import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const host = 'https://nicolasarielfernandez.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/portfolio', '/resume', '/contact'];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    // URL por defecto (Inglés sin prefijo)
    const enUrl = route === '' ? host : `${host}${route}`;
    // URL en Español
    const routeKey = route === '' ? '/' : route as keyof typeof routing.pathnames;
    const routeConfig = routing.pathnames[routeKey];
    const esRoute = typeof routeConfig === 'string' ? '' : routeConfig.es;
    const esUrl = `${host}/es${esRoute}`;

    // Añadir la entrada al sitemap
    sitemapEntries.push({
      url: enUrl,
      lastModified: new Date(),
      alternates: {
        languages: {
          en: enUrl,
          es: esUrl,
        },
      },
    });

    // Añadir explícitamente la ruta en español también como entrada principal
    // (Opcional, pero bueno para asegurar indexación completa)
    if (route !== '') {
      sitemapEntries.push({
        url: esUrl,
        lastModified: new Date(),
        alternates: {
          languages: {
            en: enUrl,
            es: esUrl,
          },
        },
      });
    }
  }

  // Si estás en la raíz, también añadimos la ruta /es explícitamente
  sitemapEntries.push({
    url: `${host}/es`,
    lastModified: new Date(),
    alternates: {
      languages: {
        en: host,
        es: `${host}/es`,
      },
    },
  });

  return sitemapEntries;
}
