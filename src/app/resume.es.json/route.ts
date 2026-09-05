import { getCvProse } from '@/lib/cv-prose';
import { toJsonResume } from '@/lib/cv-schema';

export const dynamic = 'force-static';

/** JSON Resume (jsonresume.org) — Spanish. */
export async function GET() {
  const resume = toJsonResume("es", await getCvProse("es"));

  return new Response(JSON.stringify(resume, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
