import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import PostBody from "./PostBody";
import TableOfContents from "./TableOfContents";
import { extractHeadings } from "./headings";
import DefaultCover from "./DefaultCover";
import { coverSrc, type PostDetail, type PostSummary } from "@/lib/content";

/**
 * El artículo, compartido por la página pública y por la vista previa del panel.
 *
 * Está extraído justamente para eso: una vista previa que renderice un markup
 * distinto del real no es una vista previa, es una segunda implementación que
 * se va a desviar en la primera edición que toque sólo una de las dos.
 */
const PostArticle = async ({
  post,
  locale,
  related = [],
}: {
  post: PostDetail;
  locale: string;
  related?: PostSummary[];
}) => {
  const t = await getTranslations("Blog");
  const headings = extractHeadings(post.body);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <article className="pt-24">
      <div className="section-padding pb-8">
        <div className="container mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
          >
            ← {t("backToBlog")}
          </Link>

          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {t("published")} {formatDate(post.publishedAt)}
              </time>
            )}
            {post.readingMinutes && (
              <>
                <span aria-hidden>·</span>
                <span>
                  {post.readingMinutes} {t("readingTime")}
                </span>
              </>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <span key={tag.key} className="tech-tag">
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-10">
            {coverSrc(post) ? (
              <Image
                src={coverSrc(post)!}
                alt={post.coverAlt ?? ""}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                {...(post.coverBlurDataUrl
                  ? { placeholder: "blur" as const, blurDataURL: post.coverBlurDataUrl }
                  : {})}
                className="object-cover"
                priority
              />
            ) : (
              <DefaultCover />
            )}
          </div>

          <TableOfContents headings={headings} label={t("toc")} />

          <PostBody body={post.body} />
        </div>
      </div>

      {related.length > 0 && (
        // Enlaces internos reales al final: es lo que reparte autoridad entre
        // notas y lo que evita que cada una sea un callejón.
        <div className="section-padding pt-0">
          <div className="container mx-auto max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">{t("related")}</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {related.map((other) => (
                <li key={other.key}>
                  <Link
                    href={{ pathname: "/blog/[slug]", params: { slug: other.slug } }}
                    className="block rounded-xl border border-border p-5 hover:border-accent transition-colors"
                  >
                    <span className="font-display font-bold text-foreground block mb-1">{other.title}</span>
                    <span className="text-muted-foreground text-sm line-clamp-2">{other.excerpt}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostArticle;
