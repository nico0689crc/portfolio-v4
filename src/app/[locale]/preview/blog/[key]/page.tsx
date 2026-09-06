import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import PostArticle from '@/components/pages/blog/PostArticle';
import { requireAdmin } from '@/lib/admin/auth';
import { getPostPreview } from '@/lib/admin/post-preview';

/**
 * Vive en el árbol público y no en `/admin` a propósito: hereda el layout, la
 * tipografía y los tokens del sitio, así que muestra el artículo exactamente
 * como se va a ver. Dentro del panel heredaría el CSS del backoffice, que pisa
 * `p` y `h1..h6` a nivel de elemento, y la vista previa mentiría.
 *
 * `requireAdmin()` la protege y `robots.ts` la excluye del índice: es la misma
 * URL para cualquiera, pero sólo un editor recibe algo distinto de un redirect
 * al login.
 */
export const metadata = { robots: { index: false, follow: false } };

// Un borrador cambia entre recargas; prerenderizarlo no tendría sentido.
export const dynamic = 'force-dynamic';

export default async function PostPreviewPage({
  params,
}: {
  params: Promise<{ locale: string; key: string }>;
}) {
  const { locale, key } = await params;

  await requireAdmin();
  setRequestLocale(locale);

  const post = await getPostPreview(key, locale);

  if (!post) notFound();

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 bg-accent px-4 py-2 text-center text-sm font-medium text-accent-foreground">
        Vista previa — así se va a ver. No está publicada.
      </div>
      <PostArticle post={post} locale={locale} />
    </>
  );
}
