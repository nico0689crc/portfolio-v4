"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { blogListingHref, type TagWithCount } from "./pagination";

type TagFilterProps = {
  tags: TagWithCount[];
  activeTag: TagWithCount | null;
  totalPosts: number;
};

/**
 * Un solo componente para las dos formas del filtro: sidebar fija en
 * desktop, `<select>` pegado arriba en mobile/tablet. Comparten los mismos
 * `href` (`blogListingHref`) para que ambos caminos terminen en la misma URL
 * — real navegación, no estado de cliente, así el filtro también es un link
 * que un crawler puede seguir.
 */
const TagFilter = ({ tags, activeTag, totalPosts }: TagFilterProps) => {
  const t = useTranslations("Blog");
  const router = useRouter();

  if (tags.length < 2) return null;

  const options = [{ key: null as string | null, slug: "", name: t("filter.all"), count: totalPosts }, ...tags];

  return (
    <>
      {/* Mobile / tablet: select pegado arriba del listado. */}
      <div className="lg:hidden sticky top-0 z-20 -mx-6 md:-mx-12 px-6 md:px-12 py-3 mb-8 bg-background/95 backdrop-blur-sm border-b border-border">
        <label className="sr-only" htmlFor="blog-tag-filter">
          {t("filter.label")}
        </label>
        <select
          id="blog-tag-filter"
          value={activeTag?.slug ?? ""}
          onChange={(event) => router.push(blogListingHref(1, event.target.value || null))}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {options.map((tag) => (
            <option key={tag.key ?? "all"} value={tag.slug}>
              {tag.name} ({tag.count})
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: sidebar fija. */}
      <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          {t("filter.label")}
        </h2>
        <nav className="flex flex-col gap-1">
          {options.map((tag) => {
            const isActive = activeTag?.key === tag.key;

            return (
              <Link
                key={tag.key ?? "all"}
                href={blogListingHref(1, tag.slug || null)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{tag.name}</span>
                <span className="tabular-nums opacity-60">{tag.count}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default TagFilter;
