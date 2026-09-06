import { cvFileName, renderCvPdf } from '@/lib/pdf/render';

// react-pdf necesita APIs de Node, así que la ruta no puede correr en el edge.
export const runtime = 'nodejs';

export async function GET() {
  const pdf = await renderCvPdf('es', true);

  return new Response(pdf as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${cvFileName('es', true)}"`,
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
    }
  });
}
