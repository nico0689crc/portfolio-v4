/**
 * Canonical structured record of the CV.
 *
 * Split of responsibilities:
 *  - This file owns everything language-neutral and machine-facing: ISO dates,
 *    organisations, locations, employment types, per-role skills, institutions.
 *  - `messages/{es,en}.json` owns the prose (role titles, descriptions, degree
 *    names), because that is what actually gets translated.
 *
 * Every machine-readable output — JSON-LD, /resume.json, /llms.txt — is derived
 * from here, so the site can't drift from itself the way the site and the PDF
 * currently have.
 *
 * Dates follow the website's timeline, which is authoritative. The PDFs in
 * /public are currently out of sync with it — they claim 4+ years and a
 * March 2024 freelance start — and need updating to match.
 */

export interface CvPosition {
  /** Positional join with `About.experience.jobs`; order must match. */
  id: string;
  organization: string;
  location: string;
  /** ISO 8601, YYYY-MM. */
  startDate: string;
  /** ISO 8601, YYYY-MM. `null` means current. */
  endDate: string | null;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'OTHER';
  remote: boolean;
  skills: string[];
}

export interface CvEducation {
  id: string;
  institution: string;
  location: string;
  startDate: string;
  /** `null` while still in progress. */
  endDate: string | null;
  url?: string;
}

export interface CvCertification {
  id: string;
  issuer: string;
  year: number;
}

/** Newest first, mirroring `About.experience.jobs`. */
export const positions: CvPosition[] = [
  {
    id: 'freelance-2025',
    organization: 'Self-employed',
    location: 'Corrientes, Argentina',
    startDate: '2025-03',
    endDate: null,
    employmentType: 'CONTRACTOR',
    remote: true,
    skills: [
      'React.js', 'Next.js', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS',
      'Material UI', 'MongoDB', 'PostgreSQL', 'Laravel', 'Docker', 'Git', 'AWS'
    ]
  },
  {
    id: 'it-crowd-2022',
    organization: 'IT Crowd',
    location: 'Provincia de Buenos Aires, Argentina',
    startDate: '2022-04',
    endDate: '2023-01',
    employmentType: 'FULL_TIME',
    remote: true,
    skills: ['AWS', 'Ruby on Rails', 'Python', 'JavaScript', 'Node.js', 'React.js']
  },
  {
    // Two separate stints; the outer span is what structured data can express.
    id: 'hospitality-2016',
    organization: 'Restaurants and hotels (Oceania & Europe)',
    location: 'Australia, New Zealand, Sweden, Germany',
    startDate: '2016-01',
    endDate: '2025-01',
    employmentType: 'FULL_TIME',
    remote: false,
    skills: ['Leadership', 'Time Management', 'Adaptability', 'Working under pressure']
  },
  {
    id: 'frontend-2015',
    organization: 'Self-employed',
    location: 'Corrientes, Argentina',
    startDate: '2015-01',
    endDate: '2016-03',
    employmentType: 'CONTRACTOR',
    remote: true,
    skills: ['SQL', 'HTML', 'CSS', 'JavaScript', 'AngularJS', 'jQuery', 'PHP', 'Laravel']
  },
  {
    id: 'palm-2013',
    organization: 'Soluciones Palm SA',
    location: 'Corrientes, Argentina',
    startDate: '2013-08',
    endDate: '2015-01',
    employmentType: 'FULL_TIME',
    remote: false,
    skills: ['Android', 'Java', 'Web Development']
  }
];

/** Newest first, joined positionally with `Resume.education`. */
export const education: CvEducation[] = [
  {
    id: 'coderhouse-uxui',
    institution: 'Coderhouse',
    location: 'Remote',
    startDate: '2024-01',
    endDate: null,
    url: 'https://www.coderhouse.com'
  },
  {
    id: 'nit-perth',
    institution: 'National Institute of Technology',
    location: 'Perth, Australia',
    startDate: '2024-01',
    endDate: '2024-12'
  },
  {
    id: 'unne-analyst',
    institution: 'Universidad Nacional del Nordeste',
    location: 'Corrientes, Argentina',
    startDate: '2008-01',
    endDate: '2015-12',
    url: 'https://www.unne.edu.ar'
  }
];

/** Joined positionally with `Resume.certifications`. */
export const certifications: CvCertification[] = [
  { id: 'docker-k8s', issuer: 'Academind', year: 2024 },
  { id: 'github-actions', issuer: 'Academind', year: 2024 },
  { id: 'understanding-ts', issuer: 'Academind', year: 2024 }
];

export const CV_FILES: Record<string, string> = {
  es: '/CV_Nicolas_Fernandez_FullStack_UXUI_ES.pdf',
  en: '/CV_Nicolas_Fernandez_FullStack_UXUI_EN.pdf'
};

/** Years of professional software experience, as claimed on the site. */
export const YEARS_OF_EXPERIENCE = 3;

/** Renders an ISO YYYY-MM range the way schema.org and JSON Resume expect. */
export function isoDate(value: string | null) {
  return value ? `${value}-01` : undefined;
}
