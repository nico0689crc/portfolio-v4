import { getTranslations } from 'next-intl/server';
import {
  getCertifications,
  getCvFiles,
  getEducation,
  getExperiences,
  getSkillCategories,
  getTechnicalSkills
} from '@/lib/content';
import { computeYearsOfExperience } from '@/lib/content/experience-span';
import type { CvData } from '@/lib/cv-schema';

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
    cvFiles,
    meta,
    resume
  ] = await Promise.all([
    getExperiences(locale),
    getEducation(locale),
    getCertifications(locale),
    getSkillCategories(locale),
    getTechnicalSkills(),
    getCvFiles(),
    getTranslations({ locale, namespace: 'Metadata' }),
    getTranslations({ locale, namespace: 'Resume' })
  ]);

  // Derivado de las fechas y no leído de `settings`: un número escrito a mano
  // queda desactualizado el día que se agrega un puesto, y nadie se entera
  // hasta que un reclutador cruza el CV con el LinkedIn.
  const years = computeYearsOfExperience(experiences);

  return {
    experiences,
    education,
    certifications,
    skillCategories,
    technicalSkills,
    yearsOfExperience: years,
    jobTitle: meta('jobTitle'),
    // El texto lleva `{years}` en lugar del número: la prosa sigue siendo
    // editable y la cifra no puede quedar desfasada del resto del CV.
    summary: resume('intro', { years }),
    cvFiles
  };
}
