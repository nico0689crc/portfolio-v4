import { buildRssFeed } from '@/lib/rss';

export async function GET() {
  return new Response(await buildRssFeed('en'), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // Una hora es suficiente: un lector de feeds que consulta más seguido no
      // gana nada, y el contenido cambia como mucho un par de veces por semana.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
