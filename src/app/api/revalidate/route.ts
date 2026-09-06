import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { purgeTags, TAGS } from '@/lib/content';
import { GENERATED_DOCUMENT_ROUTES } from '@/lib/content/routes';

/**
 * Invalida el cache de contenido desde afuera de la app.
 *
 * El backoffice no necesita esto: sus server actions llaman a `updateTags` en
 * el mismo proceso y el editor ve su cambio enseguida. Esta ruta es para lo que
 * escribe la base sin pasar por la app —el seed, una restauración, un cambio
 * hecho a mano en Supabase— porque `unstable_cache` no tiene TTL: sin una
 * invalidación explícita, esa escritura queda invisible para siempre.
 *
 * El secreto va en el header y no en la query para que no quede escrito en los
 * logs de acceso de cualquier proxy que haya en el medio.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET no está configurado' }, { status: 501 });
  }

  if (request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // `purgeTags` y no `updateTags`: este último tira E872 desde un Route
  // Handler, verificado en next@16.1.6.
  purgeTags([TAGS.all]);

  // Los tags tampoco alcanzan para las páginas ya renderizadas. Invalidar el
  // layout raíz arrastra todo lo que cuelga de él, que es exactamente lo que
  // pide una escritura hecha fuera de la app: no se sabe qué páginas la
  // muestran.
  //
  // Sin esto, cargar notas con el seed devolvía 200 y el listado seguía
  // mostrando las de antes. Sólo se refrescaba al tocar código, porque lo que
  // vencía el cache de ruta era la recompilación y no la invalidación.
  revalidatePath('/', 'layout');

  // Los documentos generados van igual uno por uno: no cuelgan del layout de
  // las páginas, así que el barrido de arriba no los alcanza. Sin esto el CV en
  // PDF seguía sirviendo la versión anterior aunque la respuesta dijera 200.
  for (const route of GENERATED_DOCUMENT_ROUTES) revalidatePath(route);

  return NextResponse.json({ purged: TAGS.all, at: new Date().toISOString() });
}
