import { getCvProse } from '@/lib/cv-prose';
import {
  certifications,
  education,
  positionPeriods,
  positions,
  YEARS_OF_EXPERIENCE
} from '@/data/cvData';
import { projectHref, projects } from '@/data/projectsData';
import { allTechnicalSkills } from '@/data/skillsData';
import { AUTHOR_EMAIL, SITE_NAME, SITE_URL, SOCIAL_LINKS, localizedUrl } from '@/lib/seo';

export const dynamic = 'force-static';

/** Keyed by the project's stable id, not by any locale's slug. */
const CASE_STUDY_BLURBS: Record<string, string> = {
  'mexx-ux-redesign':
    "UX/UI case study redesigning Argentina's largest tech retailer; cart persistence and shipping-cost transparency validated with Maze and UXTweak.",
  'gym-smart-access':
    'Full-stack SaaS for gym management with automated Mercado Pago billing and QR access control, built with Next.js and Supabase.',
};

function formatRange(start: string, end: string | null) {
  return `${start} — ${end ?? 'present'}`;
}

/**
 * /llms.txt — the llmstxt.org convention: a curated, plain-language digest for
 * language models, which otherwise have to infer structure from rendered HTML.
 * Deliberately contains only information that is already public on the site.
 */
export async function GET() {
  const prose = await getCvProse('en');

  const experience = positions
    .map((position, i) => {
      const job = prose.jobs[i];
      return [
        `### ${job.role} — ${position.organization}`,
        `${positionPeriods(position).map((p) => formatRange(p.startDate, p.endDate)).join(' | ')} · ${position.location}${position.remote ? ' · Remote' : ''}`,
        '',
        job.desc,
        '',
        `Technologies: ${position.skills.join(', ')}`
      ].join('\n');
    })
    .join('\n\n');

  const studies = education
    .map((entry, i) => {
      const degree = prose.degrees[i];
      return `- **${degree.degree}** — ${entry.institution}, ${entry.location} (${degree.status})`;
    })
    .join('\n');

  const certs = certifications
    .map((cert, i) => `- ${prose.certNames[i].name} — ${cert.issuer}, ${cert.year}`)
    .join('\n');

  // Both locales are listed so a model can follow either language's URL.
  const caseStudies = projects
    .map((project) => {
      const blurb = CASE_STUDY_BLURBS[project.id] ?? '';
      const urls = Object.keys(project.slugs)
        .map((l) => `${l}: ${localizedUrl(l, projectHref(project, l))}`)
        .join(' · ');
      return `- **${project.id}** — ${blurb}\n  ${urls}`;
    })
    .join('\n');

  const body = `# ${SITE_NAME}

> ${prose.jobTitle} based in Corrientes, Argentina. ${YEARS_OF_EXPERIENCE}+ years building web applications end to end — React, Next.js, TypeScript and Node.js — with a UX/UI design background. Available for remote work and freelance projects.

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
- [PDF CV, English](${SITE_URL}/CV_Nicolas_Fernandez_FullStack_UXUI_EN.pdf)
- [PDF CV, Spanish](${SITE_URL}/CV_Nicolas_Fernandez_FullStack_UXUI_ES.pdf)
- Structured data: schema.org \`Person\` with \`hasOccupationalExperience\`, \`alumniOf\` and \`hasCredential\` is embedded as JSON-LD on every page.

## Experience

${experience}

## Education

${studies}

## Certifications

${certs}

## Technical skills

${allTechnicalSkills().join(', ')}

## Languages

- Spanish — native
- English — professional working proficiency

## Case studies

${caseStudies}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
