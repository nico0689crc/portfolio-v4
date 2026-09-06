import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/routing";
import DefaultCover from "./DefaultCover";
// Directo al módulo y no al barrel de `@/lib/content`: ese reexporta `cache.ts`,
// que importa `revalidateTag`, y desde un componente cliente eso arrastra código
// de servidor al bundle y rompe la compilación. `TagFilter`/`BlogPagination` son
// client components, así que sólo llegan tipos y helpers puros de `./pagination`.
import { coverSrc } from "@/lib/content/storage";
import type { PostSummary } from "@/lib/content/types";
import type { TagWithCount } from "./pagination";
import TagFilter from "./TagFilter";
import BlogPagination from "./BlogPagination";

/** Fecha larga en el idioma de la página, sin depender del locale del server. */
const formatDate = (value: string, locale: string) =>
  new Date(value).toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

type BlogListProps = {
  posts: PostSummary[];
  locale: string;
  tags: TagWithCount[];
  activeTag: TagWithCount | null;
  totalPosts: number;
  currentPage: number;
  totalPages: number;
};

const BlogList = async ({ posts, locale, tags, activeTag, totalPosts, currentPage, totalPages }: BlogListProps) => {
  const t = await getTranslations({ locale, namespace: "Blog" });

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <Reveal
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("title")}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">{t("subtitle")}</p>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full mt-4" />
        </Reveal>

        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12 lg:items-start">
          <TagFilter tags={tags} activeTag={activeTag} totalPosts={totalPosts} />

          <div>
            {posts.length === 0 ? (
              <p className="text-muted-foreground text-center py-16">{t("empty")}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                  <Reveal
                    key={post.key}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.5 }}
                    className="card-portfolio group flex flex-col"
                    as="article"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-105">
                        {coverSrc(post) ? (
                          <Image
                            src={coverSrc(post)!}
                            alt={post.coverAlt ?? ""}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <DefaultCover />
                        )}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
                        {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>}
                        {post.readingMinutes && (
                          <>
                            <span aria-hidden>·</span>
                            <span>
                              {post.readingMinutes} {t("readingTime")}
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-accent transition-colors duration-200">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">{post.excerpt}</p>

                      <Link
                        href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline self-start"
                      >
                        {t("readMore")} →
                      </Link>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            <BlogPagination
              locale={locale}
              currentPage={currentPage}
              totalPages={totalPages}
              activeTagSlug={activeTag?.slug ?? null}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogList;
