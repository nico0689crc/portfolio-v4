import type {
  Certification,
  Education,
  Experience,
  SkillCategory
} from '@/lib/content';
import { AUTHOR_EMAIL, PERSON_ID, SITE_NAME, SITE_URL, SOCIAL_LINKS } from '@/lib/seo';

/**
 * Everything the CV documents need, already resolved for one locale.
 *
 * Passed in rather than fetched here so this module stays pure: the callers
 * (the resume page, /resume.json, /llms.txt) each own their own caching.
 */
export interface CvData {
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  skillCategories: SkillCategory[];
  /** Locale-independent skills, for the neutral `knowsAbout` field. */
  technicalSkills: string[];
  yearsOfExperience: number;
  jobTitle: string;
  summary: string;
  cvFiles: Record<string, string>;
}

/** `YYYY-MM` to the `YYYY-MM-DD` schema.org and JSON Resume expect. */
function isoDate(value: string | null | undefined) {
  return value ? `${value}-01` : undefined;
}

/** The stints actually worked, defaulting to the outer span. */
function periodsOf(experience: Experience) {
  return experience.periods?.length
    ? experience.periods
    : [{ startDate: experience.startDate, endDate: experience.endDate }];
}

/**
 * schema.org occupation history. `Occupation` on its own carries no dates, so
 * each role is expressed as an `OrganizationRole` too — that is the shape
 * Google and most LLM extractors actually read a work history from.
 */
export function occupationNodes(experiences: Experience[]) {
  // A role with a career break emits one node per stint: Google requires the
  // markup to match what the page shows, and the visible label lists both.
  return experiences.flatMap((experience) =>
    periodsOf(experience).map((period) => ({
      '@type': 'OrganizationRole',
      roleName: experience.role,
      startDate: isoDate(period.startDate),
      ...(period.endDate ? { endDate: isoDate(period.endDate) } : {}),
      description: experience.description,
      namedPosition: experience.role,
      memberOf: {
        // The neutral proper noun, not the translated `company` label the page
        // renders — an entity name should not change with the page language.
        '@type': 'Organization',
        name: experience.organization,
        address: experience.location
      },
      skills: experience.techs.join(', ')
    }))
  );
}

export function alumniOfNodes(education: Education[]) {
  return education.map((entry) => ({
    '@type': 'EducationalOrganization',
    name: entry.institution,
    ...(entry.url ? { url: entry.url } : {}),
    ...(entry.location ? { address: entry.location } : {}),
    // The award itself hangs off the organisation so the degree name survives.
    department: {
      '@type': 'EducationalOccupationalProgram',
      name: entry.degree,
      startDate: isoDate(entry.startDate),
      ...(entry.endDate ? { endDate: isoDate(entry.endDate) } : {})
    }
  }));
}

export function credentialNodes(certifications: Certification[]) {
  return certifications.map((cert) => ({
    '@type': 'EducationalOccupationalCredential',
    name: cert.name,
    credentialCategory: 'certificate',
    dateCreated: String(cert.year),
    ...(cert.url ? { url: cert.url } : {}),
    recognizedBy: { '@type': 'Organization', name: cert.issuer }
  }));
}

/**
 * The Person node as it appears on the resume page: same `@id` as the
 * site-wide one, so search engines merge them into a single entity rather than
 * treating the CV as a second person.
 */
export function cvPersonNode(cv: CvData) {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE_NAME,
    jobTitle: cv.jobTitle,
    description: cv.summary,
    email: `mailto:${AUTHOR_EMAIL}`,
    url: SITE_URL,
    image: `${SITE_URL}/profile-picture.webp`,
    sameAs: SOCIAL_LINKS,
    knowsLanguage: [
      { '@type': 'Language', name: 'Spanish', alternateName: 'es' },
      { '@type': 'Language', name: 'English', alternateName: 'en' }
    ],
    knowsAbout: cv.technicalSkills,
    hasOccupation: {
      '@type': 'Occupation',
      name: cv.jobTitle,
      occupationalCategory: '15-1254.00', // O*NET: Web Developers
      experienceRequirements: {
        '@type': 'OccupationalExperienceRequirements',
        monthsOfExperience: cv.yearsOfExperience * 12
      }
    },
    hasOccupationalExperience: occupationNodes(cv.experiences),
    alumniOf: alumniOfNodes(cv.education),
    hasCredential: credentialNodes(cv.certifications),
    workLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Corrientes',
        addressCountry: 'AR'
      }
    },
    subjectOf: Object.entries(cv.cvFiles).map(([lang, path]) => ({
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
export function toJsonResume(locale: string, cv: CvData) {
  return {
    $schema:
      'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: SITE_NAME,
      label: cv.jobTitle,
      image: `${SITE_URL}/profile-picture.webp`,
      email: AUTHOR_EMAIL,
      url: SITE_URL,
      summary: cv.summary,
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
    work: cv.experiences.flatMap((experience) =>
      periodsOf(experience).map((period) => ({
        name: experience.organization,
        position: experience.role,
        location: experience.location,
        startDate: isoDate(period.startDate),
        ...(period.endDate ? { endDate: isoDate(period.endDate) } : {}),
        summary: experience.description,
        highlights: experience.techs
      }))
    ),
    education: cv.education.map((entry) => ({
      institution: entry.institution,
      ...(entry.url ? { url: entry.url } : {}),
      area: entry.degree,
      studyType: entry.dateLabel,
      startDate: isoDate(entry.startDate),
      ...(entry.endDate ? { endDate: isoDate(entry.endDate) } : {})
    })),
    certificates: cv.certifications.map((cert) => ({
      name: cert.name,
      date: String(cert.year),
      issuer: cert.issuer
    })),
    skills: cv.skillCategories.map((category) => ({
      name: category.label,
      keywords: category.skills.map((skill) => skill.name)
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
