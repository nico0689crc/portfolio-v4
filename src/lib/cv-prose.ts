import { getTranslations } from 'next-intl/server';
import type { CvProse } from '@/lib/cv-schema';

/** Loads the translated CV prose for a locale, outside of a request context. */
export async function getCvProse(locale: string): Promise<CvProse> {
  const meta = await getTranslations({ locale, namespace: 'Metadata' });
  const about = await getTranslations({ locale, namespace: 'About' });
  const resume = await getTranslations({ locale, namespace: 'Resume' });

  return {
    jobs: about.raw('experience.jobs'),
    degrees: resume.raw('education'),
    certNames: resume.raw('certifications'),
    jobTitle: meta('jobTitle'),
    summary: resume('intro')
  };
}
