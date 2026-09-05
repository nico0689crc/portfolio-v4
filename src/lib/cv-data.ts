import { getTranslations } from 'next-intl/server';
import {
  getCertifications,
  getCvFiles,
  getEducation,
  getExperiences,
  getSkillCategories,
  getTechnicalSkills,
  getYearsOfExperience
} from '@/lib/content';
import type { CvData } from '@/lib/cv-schema';

/**
 * Used only if `settings` has no years-of-experience row. It is an editorial
 * claim rather than a computed value, so there is nothing sane to derive.
 */
const FALLBACK_YEARS = 3;

/**
 * Assembles everything the CV surfaces need for one locale.
 *
 * Shared by the resume page, `/resume.json` and `/llms.txt` so the JSON-LD, the
 * JSON Resume document and the LLM digest cannot disagree with each other. The
 * content layer caches each read and tags it, so calling this from several
 * routes costs one set of queries per build, not one per caller.
 */
export async function loadCvData(locale: string): Promise<CvData> {
  const [
    experiences,
    education,
    certifications,
    skillCategories,
    technicalSkills,
    years,
    cvFiles,
    meta,
    resume
  ] = await Promise.all([
    getExperiences(locale),
    getEducation(locale),
    getCertifications(locale),
    getSkillCategories(locale),
    getTechnicalSkills(),
    getYearsOfExperience(),
    getCvFiles(),
    getTranslations({ locale, namespace: 'Metadata' }),
    getTranslations({ locale, namespace: 'Resume' })
  ]);

  return {
    experiences,
    education,
    certifications,
    skillCategories,
    technicalSkills,
    yearsOfExperience: years ?? FALLBACK_YEARS,
    jobTitle: meta('jobTitle'),
    summary: resume('intro'),
    cvFiles
  };
}
