import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Cookie-bound Supabase client, for the backoffice ONLY.
 *
 * This is the client that carries the editor's session, so it is what RLS sees
 * as `authenticated` and what `is_admin()` resolves against. Public pages must
 * never use it: it reads cookies, which makes the route dynamic and its reads
 * uncacheable. They use `supabasePublic` instead.
 *
 * It still authenticates with the anon key. The elevated access comes from the
 * signed-in user having a row in `admins`, never from a privileged key — the
 * service-role key stays out of the app entirely.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot set cookies. Reaching this branch is
            // expected and harmless: the middleware refreshes the session on
            // the next request, so swallowing it is correct rather than lazy.
          }
        }
      }
    }
  );
}
