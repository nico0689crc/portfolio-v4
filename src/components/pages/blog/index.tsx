"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/ui/reveal";
// Directo al módulo y no al barrel de `@/lib/content`: ese reexporta `cache.ts`,
// que importa `revalidateTag`, y desde un componente cliente eso arrastra código
// de servidor al bundle y rompe la compilación.
import { coverSrc } from "@/lib/content/storage";
import type { PostSummary } from "@/lib/content/types";

/** Fecha larga en el idioma de la página, sin depender del locale del server. */
const formatDate = (value: string, locale: string) =>
  new Date(value).toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const ALL = "all";

const BlogList = ({ posts, locale }: { posts: PostSummary[]; locale: string }) => {
  const t = useTranslations("Blog");
  const [active, setActive] = useState<string>(ALL);

  // Sólo las etiquetas que tienen notas. Ofrecer un filtro que devuelve una
  // grilla vacía es peor que no ofrecerlo: el lector cree que se rompió.
  const tags = useMemo(() => {
    const seen = new Map<string, { slug: string; name: string; count: number }>();

    for (const post of posts) {
      for (const tag of post.tags) {
        const entry = seen.get(tag.key);

        if (entry) entry.count += 1;
        else seen.set(tag.key, { slug: tag.slug, name: tag.name, count: 1 });
      }
    }

    return [...seen.entries()]
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [posts]);

  const filtered = active === ALL ? posts : posts.filter((post) => post.tags.some((tag) => tag.key === active));

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

        {tags.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[{ key: ALL, name: t("filter.all"), count: posts.length }, ...tags].map((tag) => (
              <button
                key={tag.key}
                type="button"
                onClick={() => setActive(tag.key)}
                aria-pressed={active === tag.key}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  active === tag.key
                    ? "bg-accent text-accent-foreground border-accent shadow-md"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {tag.name}
                <span className="ml-1.5 opacity-60 tabular-nums">{tag.count}</span>
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">{t("empty")}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {filtered.map((post, index) => (
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
                  <Image
                    src={coverSrc(post)}
                    alt={post.coverAlt ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
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
      </div>
    </section>
  );
};

export default BlogList;
