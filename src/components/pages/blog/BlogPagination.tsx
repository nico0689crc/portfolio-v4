import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { blogListingHref, paginationRange } from "./pagination";

type BlogPaginationProps = {
  locale: string;
  currentPage: number;
  totalPages: number;
  activeTagSlug: string | null;
};

const linkClass =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors duration-200";

/**
 * Todo son `<Link>` reales apuntando a `/blog` / `/blog/page/[n]`, no botones
 * con `onClick`: es lo que hace que Google pueda descubrir la página 2 en
 * adelante rastreando el listado, sin depender de JS.
 */
const BlogPagination = async ({ locale, currentPage, totalPages, activeTagSlug }: BlogPaginationProps) => {
  if (totalPages <= 1) return null;

  const t = await getTranslations({ locale, namespace: "Blog" });
  const pages = paginationRange(currentPage, totalPages);

  return (
    <nav aria-label={t("pagination.page", { page: currentPage, total: totalPages })} className="mt-12">
      <p className="sr-only" aria-live="polite">
        {t("pagination.page", { page: currentPage, total: totalPages })}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {currentPage > 1 ? (
            <Link
              href={blogListingHref(currentPage - 1, activeTagSlug)}
              rel="prev"
              aria-label={t("pagination.previous")}
              className={`${linkClass} text-muted-foreground hover:bg-muted hover:text-foreground`}
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline ml-1">{t("pagination.previous")}</span>
            </Link>
          ) : (
            <span aria-hidden className={`${linkClass} text-muted-foreground/40`}>
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline ml-1">{t("pagination.previous")}</span>
            </span>
          )}
        </li>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <li key={`ellipsis-${index}`} aria-hidden className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={blogListingHref(page, activeTagSlug)}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={t("pagination.goToPage", { page })}
                className={`${linkClass} tabular-nums ${
                  page === currentPage
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {page}
              </Link>
            </li>
          )
        )}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={blogListingHref(currentPage + 1, activeTagSlug)}
              rel="next"
              aria-label={t("pagination.next")}
              className={`${linkClass} text-muted-foreground hover:bg-muted hover:text-foreground`}
            >
              <span className="hidden sm:inline mr-1">{t("pagination.next")}</span>
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span aria-hidden className={`${linkClass} text-muted-foreground/40`}>
              <span className="hidden sm:inline mr-1">{t("pagination.next")}</span>
              <ChevronRight className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default BlogPagination;
