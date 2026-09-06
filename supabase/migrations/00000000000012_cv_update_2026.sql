-- Actualización del CV con la trayectoria al día.
--
-- Faltaban las dos posiciones actuales —EVOLVERE y el producto propio—, seis
-- certificaciones y el título de gastronomía. Todo esto es contenido: se puede
-- corregir después desde /admin/curriculum sin tocar código. Queda como
-- migración para que el cambio sea revisable.
--
-- Los roles de cocina siguen agregados en una sola entrada en lugar de listarse
-- uno por uno. Son catorce puestos entre 2011 y 2025, y desplegarlos empujaría
-- la experiencia técnica fuera de la primera pantalla de cualquier reclutador.
-- La entrada agregada conserva el dato —nueve años, cinco países, jefe de
-- cocina— sin competir con lo que se está buscando.

-- ------------------------------------------------------------------ orden
-- Se recalcula entero: las dos nuevas van arriba y todo lo demás baja.
update public.experiences set sort_order = sort_order + 2;

-- --------------------------------------------------------------- EVOLVERE
with nueva as (
  insert into public.experiences
    (organization, employment_type, remote, techs, start_date, end_date, sort_order)
  values (
    'EVOLVERE', 'FULL_TIME', false,
    array['Vue.js', 'Next.js', 'React', 'TypeScript', 'NestJS', 'Laravel', 'PostgreSQL',
          'SQL Server', 'Redis', 'Docker', 'GitHub Actions', 'Figma'],
    '2026-05-01', null, 0
  )
  returning id
)
insert into public.experience_translations (experience_id, locale, role, location, date_label, description)
select nueva.id, t.locale, t.role, t.location, t.date_label, t.description
from nueva, (values
  ('es',
   'Desarrollador Fullstack SSR',
   'Corrientes, Argentina',
   'Mayo 2026 - Actualidad',
   'Construyo soluciones de punta a punta donde el código y el diseño se piensan juntos desde el principio. Trabajo tanto en proyectos donde recorro el camino completo —diseño, desarrollo y despliegue— como en equipos multidisciplinarios. Decido el stack por proyecto, armo los pipelines de CI/CD e integro la experiencia de usuario desde el prototipado, no como una capa que se agrega al final.'),
  ('en',
   'SSR Fullstack Developer',
   'Corrientes, Argentina',
   'May 2026 - Present',
   'I build end-to-end solutions where code and design are considered together from the start. I work both on projects where I own the whole path — design, development and deployment — and within multidisciplinary teams. I choose the stack per project, set up CI/CD pipelines, and integrate user experience from the prototyping stage rather than as a layer added at the end.')
) as t(locale, role, location, date_label, description);

-- ------------------------------------------------ producto propio: GymSmartAccess
with nueva as (
  insert into public.experiences
    (organization, employment_type, remote, techs, start_date, end_date, sort_order)
  values (
    'GymSmartAccess', 'CONTRACTOR', true,
    array['Next.js', 'React', 'Tailwind CSS', 'NestJS', 'PostgreSQL', 'MercadoPago',
          'Docker', 'GitHub Actions', 'Figma'],
    '2026-02-01', null, 1
  )
  returning id
)
insert into public.experience_translations (experience_id, locale, role, location, date_label, description)
select nueva.id, t.locale, t.role, t.location, t.date_label, t.description
from nueva, (values
  ('es',
   'Fundador y Desarrollador Full Stack',
   'Corrientes, Argentina · Remoto',
   'Febrero 2026 - Actualidad',
   'Construí GymSmartAccess desde cero: una plataforma SaaS que resuelve cobros, control de acceso y gestión de socios para gimnasios independientes en Argentina. Hice la arquitectura, el diseño de interfaz y el despliegue en producción. Está en el mercado con clientes que pagan, iterando sobre feedback real. Me obligó a pensar cada funcionalidad como una decisión de producto y no sólo como código.'),
  ('en',
   'Founder & Full-Stack Developer',
   'Corrientes, Argentina · Remote',
   'February 2026 - Present',
   'I built GymSmartAccess from zero: a SaaS platform solving payments, access control and member management for independent gyms in Argentina. I owned the architecture, the interface design and the production deployment. It is live with paying customers, iterating on real feedback. It forced me to treat every feature as a product decision rather than just code.')
) as t(locale, role, location, date_label, description);

-- ------------------------------------------------------------------ Workana
-- Era "Self-employed": el cliente real es la plataforma, y nombrarla le da a un
-- reclutador algo verificable en lugar de una etiqueta genérica.
update public.experiences set
  organization = 'Workana',
  techs = array['React.js', 'Next.js', 'TypeScript', 'Node.js', 'Express.js', 'NestJS',
                'GraphQL', 'Laravel', 'Ruby on Rails', 'MongoDB', 'PostgreSQL', 'MySQL',
                'Docker', 'AWS']
where organization = 'Self-employed' and start_date = '2025-03-01';

-- ------------------------------------------------------------------ estudios
insert into public.education (institution, start_date, end_date, sort_order)
select 'CECAL Institute', '2014-01-01', '2015-12-01', 3
-- `education` no tiene constraint de unicidad, así que la idempotencia es
-- explícita: sin esto, correr la migración dos veces duplicaría el título.
where not exists (select 1 from public.education where institution = 'CECAL Institute');

insert into public.education_translations (education_id, locale, degree, date_label, location)
select e.id, t.locale, t.degree, t.date_label, t.location
from public.education e, (values
  ('es', 'Artes Culinarias y Cocina Profesional', '2014 - 2015', 'Corrientes, Argentina'),
  ('en', 'Culinary Arts and Professional Cookery', '2014 - 2015', 'Corrientes, Argentina')
) as t(locale, degree, date_label, location)
where e.institution = 'CECAL Institute'
on conflict (education_id, locale) do nothing;

-- La diplomatura de UX/UI ya terminó; tenía la fecha de cuando se cargó.
update public.education
set start_date = '2025-09-01', end_date = '2026-08-01'
where institution = 'Coderhouse';

-- ------------------------------------------------------------ certificaciones
-- Las seis que faltaban. El `url` apunta al certificado verificable de Udemy:
-- un reclutador que no puede comprobarlo lo trata como si no existiera.
insert into public.certifications (issuer, year, url, sort_order)
values
  ('Academind', 2021, 'https://www.udemy.com/certificate/UC-c5d2a7ea-eacb-4926-9c34-7e10a431cd03/', 3),
  ('Academind', 2021, 'https://www.udemy.com/certificate/UC-21effcb0-b7d6-4c05-b629-959d8299acd3/', 4),
  ('Academind', 2021, 'https://www.udemy.com/certificate/UC-7c7a0a61-f541-43bb-a141-a735e40a7e26/', 5),
  ('Academind', 2021, 'https://www.udemy.com/certificate/UC-b5e4ac14-754b-4c4a-9b81-f401e820a979/', 6),
  ('Academind', 2021, 'https://www.udemy.com/certificate/UC-320fb122-370e-4d2f-b2c6-568683dd88c1/', 7),
  ('Academind', 2020, 'https://www.udemy.com/certificate/UC-67ca9ef3-9670-4ba6-a6fe-0a31b7a5d36b/', 8);

insert into public.certification_translations (certification_id, locale, name)
select c.id, t.locale, t.name
from public.certifications c
join (values
  ('UC-c5d2a7ea-eacb-4926-9c34-7e10a431cd03', 'es', 'React — La Guía Completa (Hooks, Router, Redux)'),
  ('UC-c5d2a7ea-eacb-4926-9c34-7e10a431cd03', 'en', 'React - The Complete Guide (Hooks, Router, Redux)'),
  ('UC-21effcb0-b7d6-4c05-b629-959d8299acd3', 'es', 'Node.js — La Guía Completa (MVC, REST, GraphQL)'),
  ('UC-21effcb0-b7d6-4c05-b629-959d8299acd3', 'en', 'Node.js - The Complete Guide (MVC, REST, GraphQL)'),
  ('UC-7c7a0a61-f541-43bb-a141-a735e40a7e26', 'es', 'JavaScript — La Guía Completa'),
  ('UC-7c7a0a61-f541-43bb-a141-a735e40a7e26', 'en', 'JavaScript - The Complete Guide'),
  ('UC-b5e4ac14-754b-4c4a-9b81-f401e820a979', 'es', 'CSS — La Guía Completa (Flexbox, Grid y Sass)'),
  ('UC-b5e4ac14-754b-4c4a-9b81-f401e820a979', 'en', 'CSS - The Complete Guide (Flexbox, Grid & Sass)'),
  ('UC-320fb122-370e-4d2f-b2c6-568683dd88c1', 'es', 'MongoDB — Guía Completa para Desarrolladores'),
  ('UC-320fb122-370e-4d2f-b2c6-568683dd88c1', 'en', 'MongoDB - The Complete Developer Guide'),
  ('UC-67ca9ef3-9670-4ba6-a6fe-0a31b7a5d36b', 'es', 'MERN Fullstack: React, Node, Express y MongoDB'),
  ('UC-67ca9ef3-9670-4ba6-a6fe-0a31b7a5d36b', 'en', 'MERN Fullstack: React, Node, Express & MongoDB')
) as t(cred, locale, name) on c.url like '%' || t.cred || '%'
on conflict (certification_id, locale) do nothing;
