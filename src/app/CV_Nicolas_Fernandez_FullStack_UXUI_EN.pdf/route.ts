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
      // `max-age=0` deja que el navegador revalide en cada visita. Con 3600
      // guardaba el PDF una hora: se actualizaba la base, se invalidaba el
      // cache del servidor, y quien ya lo habia abierto seguia viendo el viejo
      // sin forma de saberlo. Es el mismo perfil que usa /resume.json, y por la
      // misma razon: el documento tiene que reflejar el contenido de ahora.
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
    }
  });
}
