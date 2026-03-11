const fs = require('fs');
const path = require('path');

const HOST = 'https://nicolasarielfernandez.com';

const routes = [
  { en: '/', es: '/' },
  { en: '/about', es: '/sobre-mi' },
  { en: '/portfolio', es: '/portafolio' },
  { en: '/resume', es: '/curriculum' },
  { en: '/contact', es: '/contacto' }
];

function generateSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  const date = new Date().toISOString().split('T')[0];

  routes.forEach(route => {
    const enUrl = route.en === '/' ? HOST : `${HOST}${route.en}`;
    const esUrl = route.es === '/' ? `${HOST}/es` : `${HOST}/es${route.es}`;

    // English Entry
    xml += `  <url>\n`;
    xml += `    <loc>${enUrl}</loc>\n`;
    xml += `    <lastmod>${date}</lastmod>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${esUrl}" />\n`;
    xml += `  </url>\n`;

    // Spanish Entry
    xml += `  <url>\n`;
    xml += `    <loc>${esUrl}</loc>\n`;
    xml += `    <lastmod>${date}</lastmod>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="es" href="${esUrl}" />\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
  console.log('✅ sitemap.xml generated successfully in public/');
}

function generateRobots() {
  const txt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

Sitemap: ${HOST}/sitemap.xml
`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, 'robots.txt'), txt);
  console.log('✅ robots.txt generated successfully in public/');
}

generateSitemap();
generateRobots();
