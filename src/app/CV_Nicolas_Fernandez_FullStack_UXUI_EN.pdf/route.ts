import { cvFileName, renderCvPdf } from '@/lib/pdf/render';

// react-pdf necesita APIs de Node, así que la ruta no puede correr en el edge.
export const runtime = 'nodejs';

export async function GET() {
  const pdf = await renderCvPdf('en');

  return new Response(pdf as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      // `inline` y no `attachment`: quien lo abre desde el sitio espera verlo,
      // no que se le descargue un archivo sin previsualizar. El nombre igual
      // se respeta cuando decide guardarlo.
      'Content-Disposition': `inline; filename="${cvFileName('en')}"`,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
