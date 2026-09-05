import {
  CV_FILES,
  certifications,
  education,
  isoDate,
  positionPeriods,
  positions,
  YEARS_OF_EXPERIENCE
} from '@/data/cvData';
import { allTechnicalSkills, skillCategories, skillsForLocale } from '@/data/skillsData';
import { AUTHOR_EMAIL, PERSON_ID, SITE_NAME, SITE_URL, SOCIAL_LINKS } from '@/lib/seo';

/** Translated prose, supplied by the caller from the message catalogue. */
export interface CvProse {
  jobs: Array<{ role: string; company: string; date: string; desc: string; tech: string }>;
  degrees: Array<{ degree: string; status: string }>;
  certNames: Array<{ name: string }>;
  jobTitle: string;
  summary: string;
}

/**
 * schema.org occupation history. `Occupation` on its own carries no dates, so
 * each role is expressed as an `OrganizationRole` too — that is the shape
 * Google and most LLM extractors actually read a work history from.
 */
export function occupationNodes(prose: CvProse) {
  // A role with a career break emits one node per stint: Google requires the
  // markup to match what the page shows, and the visible date label lists both.
  return positions.flatMap((position, i) => {
    const job = prose.jobs[i];
    return positionPeriods(position).map((period) => ({
      '@type': 'OrganizationRole',
      roleName: job.role,
      startDate: isoDate(period.startDate),
      ...(period.endDate ? { endDate: isoDate(period.endDate) } : {}),
      description: job.desc,
      namedPosition: job.role,
      memberOf: {
        '@type': 'Organization',
        name: position.organization,
        address: position.location
      },
      skills: position.skills.join(', ')
    }));
  });
}

export function alumniOfNodes(prose: CvProse) {
  return education.map((entry, i) => ({
    '@type': 'EducationalOrganization',
    name: entry.institution,
    ...(entry.url ? { url: entry.url } : {}),
    address: entry.location,
    // The award itself hangs off the organisation so the degree name survives.
    department: {
      '@type': 'EducationalOccupationalProgram',
      name: prose.degrees[i].degree,
      startDate: isoDate(entry.startDate),
      ...(entry.endDate ? { endDate: isoDate(entry.endDate) } : {})
    }
  }));
}

export function credentialNodes(prose: CvProse) {
  return certifications.map((cert, i) => ({
    '@type': 'EducationalOccupationalCredential',
    name: prose.certNames[i].name,
    credentialCategory: 'certificate',
    dateCreated: String(cert.year),
    recognizedBy: { '@type': 'Organization', name: cert.issuer }
  }));
}

/**
 * The Person node as it appears on the resume page: same `@id` as the
 * site-wide one, so search engines merge them into a single entity rather than
 * treating the CV as a second person.
 */
export function cvPersonNode(locale: string, prose: CvProse) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE_NAME,
    jobTitle: prose.jobTitle,
    description: prose.summary,
    email: `mailto:${AUTHOR_EMAIL}`,
    url: SITE_URL,
    image: `${SITE_URL}/profile-picture.webp`,
    sameAs: SOCIAL_LINKS,
    knowsLanguage: [
      { '@type': 'Language', name: 'Spanish', alternateName: 'es' },
      { '@type': 'Language', name: 'English', alternateName: 'en' }
    ],
    knowsAbout: allTechnicalSkills(),
    hasOccupation: {
      '@type': 'Occupation',
      name: prose.jobTitle,
      occupationalCategory: '15-1254.00', // O*NET: Web Developers
      experienceRequirements: {
        '@type': 'OccupationalExperienceRequirements',
        monthsOfExperience: YEARS_OF_EXPERIENCE * 12
      }
    },
    hasOccupationalExperience: occupationNodes(prose),
    alumniOf: alumniOfNodes(prose),
    hasCredential: credentialNodes(prose),
    workLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Corrientes',
        addressCountry: 'AR'
      }
    },
    subjectOf: Object.entries(CV_FILES).map(([lang, path]) => ({
      '@type': 'DigitalDocument',
      name: `${SITE_NAME} — CV (${lang.toUpperCase()})`,
      url: `${SITE_URL}${path}`,
      encodingFormat: 'application/pdf',
      inLanguage: lang
    }))
  };
}

/* -------------------------------------------------------------------------- */
/*                                JSON Resume                                 */
/* -------------------------------------------------------------------------- */

/**
 * https://jsonresume.org — a widely-supported machine format for CVs. Serving
 * it gives parsers a precise record instead of making them scrape the page.
 */
export function toJsonResume(locale: string, prose: CvProse) {
  return {
    $schema:
      'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: SITE_NAME,
      label: prose.jobTitle,
      image: `${SITE_URL}/profile-picture.webp`,
      email: AUTHOR_EMAIL,
      url: SITE_URL,
      summary: prose.summary,
      location: {
        city: 'Corrientes',
        countryCode: 'AR',
        region: 'Corrientes'
      },
      profiles: [
        {
          network: 'LinkedIn',
          username: 'nicolas-ariel-fernandez',
          url: SOCIAL_LINKS[0]
        },
        { network: 'GitHub', username: 'nico0689crc', url: SOCIAL_LINKS[1] }
      ]
    },
    work: positions.flatMap((position, i) =>
      positionPeriods(position).map((period) => ({
        name: position.organization,
        position: prose.jobs[i].role,
        location: position.location,
        startDate: isoDate(period.startDate),
        ...(period.endDate ? { endDate: isoDate(period.endDate) } : {}),
        summary: prose.jobs[i].desc,
        highlights: position.skills
      }))
    ),
    education: education.map((entry, i) => ({
      institution: entry.institution,
      ...(entry.url ? { url: entry.url } : {}),
      area: prose.degrees[i].degree,
      studyType: prose.degrees[i].status,
      startDate: isoDate(entry.startDate),
      ...(entry.endDate ? { endDate: isoDate(entry.endDate) } : {})
    })),
    certificates: certifications.map((cert, i) => ({
      name: prose.certNames[i].name,
      date: String(cert.year),
      issuer: cert.issuer
    })),
    skills: skillCategories.map((category) => ({
      name: category.labelKey.replace('skills.', ''),
      keywords: skillsForLocale(category, locale)
    })),
    languages: [
      { language: 'Spanish', fluency: 'Native speaker' },
      { language: 'English', fluency: 'Professional working proficiency' }
    ],
    meta: {
      canonical: `${SITE_URL}/resume.json`,
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      language: locale
    }
  };
}
