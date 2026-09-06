import { renderToBuffer } from '@react-pdf/renderer';
import { getTranslations } from 'next-intl/server';
import CvDocument from './CvDocument';
import { loadCvData } from '@/lib/cv-data';

/**
 * El CV en PDF de un idioma.
 *
 * Lee por `loadCvData()`, el mismo que alimentan la página del CV, el JSON
 * Resume y el JSON-LD. Es lo que hace que el PDF no pueda quedar desactualizado
 * respecto del resto del sitio, que era justamente el problema del archivo
 * exportado a mano.
 *
 * Los títulos de sección salen de los mismos mensajes que usa la página, así
 * que traducir el sitio traduce el PDF.
 */
export async function renderCvPdf(locale: string, extended = false): Promise<Uint8Array> {
  const [cv, t] = await Promise.all([
    loadCvData(locale),
    getTranslations({ locale, namespace: 'Resume' })
  ]);

  return renderToBuffer(
    <CvDocument
      cv={cv}
      locale={locale}
      extended={extended}
      labels={{
        summary: t('summaryTitle'),
        experience: t('experienceTitle'),
        education: t('educationTitle'),
        skills: t('skillsTitle'),
        certifications: t('certificationsTitle')
      }}
    />
  );
}

/**
 * El mismo nombre que tenían los archivos estáticos.
 *
 * No es cosmético: esas URLs pueden estar en un LinkedIn, en una firma de mail
 * o en una postulación ya enviada. Conservarlas hace que todo eso siga
 * resolviendo, ahora con el CV al día en vez de con la copia congelada.
 */
export function cvFileName(locale: string, extended = false) {
  return `CV_Nicolas_Fernandez_FullStack_UXUI_${locale.toUpperCase()}${extended ? '_Extended' : ''}.pdf`;
}
