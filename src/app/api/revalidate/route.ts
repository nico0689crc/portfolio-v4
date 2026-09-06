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

  // Los tags no alcanzan para los documentos generados: verificado en
  // next@16.1.6 que `revalidateTag` no purga las entradas de `unstable_cache`,
  // mientras que `revalidatePath` sí fuerza el re-render. Sin esto el CV en PDF
  // seguía sirviendo la versión anterior aunque la respuesta dijera 200.
  for (const route of GENERATED_DOCUMENT_ROUTES) revalidatePath(route);

  return NextResponse.json({ purged: TAGS.all, at: new Date().toISOString() });
}
