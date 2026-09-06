import { loadCvData } from '@/lib/cv-data';
import { getProjects, getProjectSlugMap } from '@/lib/content';
import { AUTHOR_EMAIL, SITE_NAME, SITE_URL, SOCIAL_LINKS, localizedUrl } from '@/lib/seo';

function formatRange(start: string | null, end: string | null) {
  return `${start ?? '?'} — ${end ?? 'present'}`;
}

/**
 * /llms.txt — the llmstxt.org convention: a curated, plain-language digest for
 * language models, which otherwise have to infer structure from rendered HTML.
 * Deliberately contains only information that is already public on the site.
 */
export async function GET() {
  const [cv, projects, slugMap] = await Promise.all([
    loadCvData('en'),
    getProjects('en'),
    getProjectSlugMap()
  ]);

  const experience = cv.experiences
    .map((job) => {
      const stints = (job.periods?.length
        ? job.periods
        : [{ startDate: job.startDate, endDate: job.endDate }]
      )
        .map((p) => formatRange(p.startDate, p.endDate))
        .join(' | ');
      return [
        `### ${job.role} — ${job.organization}`,
        `${stints} · ${job.location}${job.remote ? ' · Remote' : ''}`,
        '',
        job.description,
        '',
        `Technologies: ${job.techs.join(', ')}`
      ].join('\n');
    })
    .join('\n\n');

  const studies = cv.education
    .map(
      (entry) =>
        `- **${entry.degree}** — ${entry.institution}${entry.location ? `, ${entry.location}` : ''} (${entry.dateLabel})`
    )
    .join('\n');

  const certs = cv.certifications
    .map((cert) => `- ${cert.name} — ${cert.issuer}, ${cert.year}`)
    .join('\n');

  // Both locales are listed so a model can follow either language's URL.
  const slugsByKey = new Map(slugMap.map((entry) => [entry.key, entry.slugs]));
  const caseStudies = projects
    .map((project) => {
      const slugs = slugsByKey.get(project.key) ?? {};
      const urls = Object.entries(slugs)
        .map(
          ([l, slug]) =>
            `${l}: ${localizedUrl(l, { pathname: '/projects/[slug]', params: { slug } })}`
        )
        .join(' · ');
      return `- **${project.title}** — ${project.description}\n  ${urls}`;
    })
    .join('\n');

  const body = `# ${SITE_NAME}

> ${cv.jobTitle} based in Corrientes, Argentina. ${cv.yearsOfExperience}+ years building web applications end to end — React, Next.js, TypeScript and Node.js — with a UX/UI design background. Available for remote work and freelance projects.

This file summarises a personal portfolio site for language models. Everything here is public information published by the site owner. The site is bilingual: English pages have no locale prefix, Spanish pages are served under \`/es\`.

## Contact

- Email: ${AUTHOR_EMAIL}
- LinkedIn: ${SOCIAL_LINKS[0]}
- GitHub: ${SOCIAL_LINKS[1]}

## Key pages

- [Home](${localizedUrl('en', '/')}): overview, skills and highlights. Spanish: ${localizedUrl('es', '/')}
- [About](${localizedUrl('en', '/about')}): background, full work history and FAQ. Spanish: ${localizedUrl('es', '/about')}
- [Portfolio](${localizedUrl('en', '/portfolio')}): project index. Spanish: ${localizedUrl('es', '/portfolio')}
- [Resume](${localizedUrl('en', '/resume')}): condensed CV, education and certifications. Spanish: ${localizedUrl('es', '/resume')}
- [Contact](${localizedUrl('en', '/contact')}): contact form. Spanish: ${localizedUrl('es', '/contact')}

## Machine-readable CV

- [JSON Resume, English](${SITE_URL}/resume.json) — jsonresume.org schema
- [JSON Resume, Spanish](${SITE_URL}/resume.es.json)
${Object.entries(cv.cvFiles).map(([l, path]) => `- [PDF CV, ${l.toUpperCase()}](${SITE_URL}${path})`).join('\n')}
- Structured data: schema.org \`Person\` with \`hasOccupationalExperience\`, \`alumniOf\` and \`hasCredential\` is embedded as JSON-LD on every page.

## Experience

${experience}

## Education

${studies}

## Certifications

${certs}

## Technical skills

${cv.technicalSkills.join(', ')}

## Languages

- Spanish — native
- English — professional working proficiency

## Case studies

${caseStudies}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Short shared cache: the content is now database-backed and invalidated
      // by tag, so a day-long s-maxage would keep serving a stale document long
      // after the page itself had updated. Re-running the handler is cheap —
      // the content layer's reads are cached — and stale-while-revalidate means
      // the refresh costs no latency.
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
    }
  });
}
