import { loadCvData } from '@/lib/cv-data';
import { toJsonResume } from '@/lib/cv-schema';

/**
 * JSON Resume (jsonresume.org) — Spanish.
 *
 * No `force-static`: the content comes from Supabase and the reads inside the
 * content layer are cached and tagged, so the backoffice can invalidate this
 * document instead of it being frozen at build time.
 */
export async function GET() {
  const resume = toJsonResume('es', await loadCvData('es'));

  return new Response(JSON.stringify(resume, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Short shared cache: the content is now database-backed and invalidated
      // by tag, so a day-long s-maxage would keep serving a stale document long
      // after the page itself had updated. Re-running the handler is cheap —
      // the content layer's reads are cached — and stale-while-revalidate means
      // the refresh costs no latency.
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
    }
  });
}
