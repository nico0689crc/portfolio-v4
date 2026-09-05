import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPageSeo, getProject, getProjectSlugMap, getRedirectedSlug } from "@/lib/content";
import { permanentRedirect, routing } from "@/i18n/routing";
import ProjectCaseClient from "./ProjectCaseClient";
import { JsonLd } from "@/components/seo/json-ld";
import {
  PERSON_ID,
  SITE_URL,
  breadcrumbSchema,
  buildPageMetadata,
  jsonLdGraph,
  localizedUrl,
} from "@/lib/seo";

/**
 * Each locale's URL for one project, for the canonical + hreflang cluster.
 *
 * Slugs are translated, so the other language's URL cannot be derived from this
 * one — it has to be looked up. Falling back to the requested slug keeps a
 * project that is published in only one language from breaking the cluster.
 */
async function hrefResolver(key: string, fallbackSlug: string) {
  const map = await getProjectSlugMap();
  const slugs = map.find((entry) => entry.key === key)?.slugs ?? {};

  return (locale: string) => ({
    pathname: "/projects/[slug]" as const,
    params: { slug: slugs[locale] ?? fallbackSlug },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getProject(slug, locale);

  if (!project) {
    // Un slug que no resuelve todavia puede redirigir, asi que la metadata cae
    // a la del listado en vez de inventar un titulo para una pagina que quiza
    // ni se llegue a renderizar.
    const [seo, t] = await Promise.all([
      getPageSeo("/portfolio", locale),
      getTranslations({ locale, namespace: "Metadata" }),
    ]);

    return buildPageMetadata({
      locale,
      href: { pathname: "/projects/[slug]", params: { slug } },
      title: seo?.title ?? t("defaultTitle"),
      description: seo?.description ?? t("defaultDescription"),
      image: "/og/default.png",
      type: "article",
    });
  }

  return buildPageMetadata({
    locale,
    href: await hrefResolver(project.key, slug),
    // The SEO fields are optional overrides; the visible title and description
    // are the sensible default when the editor has not set them.
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.description,
    image: project.ogImage ?? "/og/default.png",
    type: "article",
    noindex: project.noindex,
  });
}

export async function generateStaticParams() {
  const map = await getProjectSlugMap();

  // Each locale is prerendered under its own translated slug.
  return map.flatMap((entry) =>
    routing.locales.flatMap((locale) =>
      entry.slugs[locale] ? [{ locale, slug: entry.slugs[locale] }] : []
    )
  );
}

export default async function ProjectCasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = await getProject(slug, locale);

  if (!project) {
    // A slug that no longer resolves may be one the editor renamed. The
    // redirect table is what keeps the old URL's ranking instead of 404-ing,
    // and it is only consulted on the miss so the happy path costs nothing.
    const current = await getRedirectedSlug("project", locale, slug);

    if (current) {
      permanentRedirect({
        href: { pathname: "/projects/[slug]", params: { slug: current } },
        locale,
      });
    }

    notFound();
  }

  const tHeader = await getTranslations({ locale, namespace: "Header" });
  const url = localizedUrl(locale, {
    pathname: "/projects/[slug]",
    params: { slug: project.slug },
  });

  const schema = jsonLdGraph(
    {
      "@type": "CreativeWork",
      "@id": `${url}#project`,
      url,
      name: project.title,
      headline: project.seoTitle ?? project.title,
      description: project.seoDescription ?? project.description,
      inLanguage: locale,
      author: { "@id": PERSON_ID },
      creator: { "@id": PERSON_ID },
      keywords: project.techs.join(", "),
      image: `${SITE_URL}${project.ogImage ?? "/og/default.png"}`,
      isPartOf: { "@id": `${localizedUrl(locale, "/portfolio")}#collectionpage` },
    },
    breadcrumbSchema([
      { name: tHeader("home"), url: localizedUrl(locale, "/") },
      { name: tHeader("portfolio"), url: localizedUrl(locale, "/portfolio") },
      { name: project.title, url },
    ])
  );

  return (
    <>
      <ProjectCaseClient project={project} />
      <JsonLd data={schema} />
    </>
  );
}
