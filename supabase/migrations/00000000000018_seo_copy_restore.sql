-- Restaura los textos de SEO que el seed borró.
--
-- La migración 11 los cargó y una corrida de `seed-content.mjs` los revirtió:
-- `seedPageSeo()` hace upsert desde los archivos de mensajes, así que pisa fila
-- por fila sin dejar señal — no hay diferencia de conteo que lo delate, a
-- diferencia de lo que le pasó al CV.
--
-- Son UPDATE, así que reejecutar esta migración no rompe nada. El seed queda
-- con un guard global en el mismo commit para que no vuelva a pasar.

-- ---------------------------------------------------------------- portada
-- Decía "Inicio" / "Home": una etiqueta de navegación, no un título. Es la
-- página más importante del sitio y la única que emite su título completo.
update public.page_seo_translations set
  title = 'Nicolás Ariel Fernández — Desarrollador Full Stack',
  description = 'Desarrollador Full Stack y diseñador UX/UI en Argentina. React, Next.js, Node y TypeScript. Disponible para trabajo remoto en Europa y EE. UU.'
where route_key = '/' and locale = 'es';

update public.page_seo_translations set
  title = 'Nicolás Ariel Fernández — Full Stack Developer',
  description = 'Full Stack Developer and UX/UI designer based in Argentina. React, Next.js, Node, TypeScript. Available for remote roles in Europe and the US.'
where route_key = '/' and locale = 'en';

-- ---------------------------------------------------------------- sobre mí
-- La carrera gastronómica es el diferencial que nadie más tiene; enterrarla en
-- el cuerpo desperdicia la única línea que hace que alguien siga leyendo.
update public.page_seo_translations set
  title = 'Perfil y trayectoria',
  description = 'Nueve años de cocina profesional en Australia y Europa, y una década construyendo software. Cómo esa mezcla define mi forma de trabajar.'
where route_key = '/about' and locale = 'es';

update public.page_seo_translations set
  title = 'About — Full Stack Developer',
  description = 'Nine years in professional kitchens across Australia and Europe, and a decade building software. How that mix shapes the way I work.'
where route_key = '/about' and locale = 'en';

-- ---------------------------------------------------------------- currículum
-- La página donde efectivamente aterriza un reclutador. Menciona los formatos
-- descargables porque son la diferencia entre que copie datos a mano o no.
update public.page_seo_translations set
  title = 'CV — Desarrollador Full Stack',
  description = 'Trayectoria, stack y certificaciones. Full Stack con React, Next.js, Node y PostgreSQL, más diseño UX/UI. CV descargable en PDF y JSON.'
where route_key = '/resume' and locale = 'es';

update public.page_seo_translations set
  title = 'Résumé — Full Stack Developer',
  description = 'Experience, stack and certifications. Full Stack with React, Next.js, Node and PostgreSQL, plus UX/UI design. Downloadable CV in PDF and JSON.'
where route_key = '/resume' and locale = 'en';

-- ---------------------------------------------------------------- portafolio
-- "Casos de estudio" y no "proyectos": describe lo que realmente hay, y es lo
-- que distingue un portafolio de una galería de capturas.
update public.page_seo_translations set
  title = 'Proyectos y casos de estudio',
  description = 'Casos de estudio completos: el problema, las decisiones de diseño y el resultado medido. Rediseño UX de un e-commerce y un SaaS de gestión.'
where route_key = '/portfolio' and locale = 'es';

update public.page_seo_translations set
  title = 'Projects & case studies',
  description = 'Full case studies: the problem, the design decisions and the measured outcome. A UX redesign for e-commerce and a SaaS management platform.'
where route_key = '/portfolio' and locale = 'en';

-- ---------------------------------------------------------------- contacto
-- El huso horario es información operativa para alguien en Madrid o Nueva York:
-- UTC-3 solapa media jornada con Europa y casi toda con la costa este.
update public.page_seo_translations set
  title = 'Contacto y disponibilidad',
  description = 'Escribime para proyectos, roles remotos o consultas técnicas. Respondo en el día, en español o inglés, desde Argentina (UTC-3).'
where route_key = '/contact' and locale = 'es';

update public.page_seo_translations set
  title = 'Contact & availability',
  description = 'Get in touch about projects, remote roles or technical questions. Same-day reply, in English or Spanish, from Argentina (UTC-3).'
where route_key = '/contact' and locale = 'en';
