import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  projectByLocalizedSlug,
  projectHref,
  projects,
  projectSlug,
} from "@/data/projectsData";
import { routing } from "@/i18n/routing";
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

/** Keyed by the project's stable id, not by any locale's slug. */
const metaKeyById: Record<string, { title: string; description: string }> = {
  "mexx-ux-redesign": { title: "mexxTitle", description: "mexxDescription" },
  "gym-smart-access": { title: "gymTitle", description: "gymDescription" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const project = projectByLocalizedSlug(slug, locale);
  const keys = project ? metaKeyById[project.id] : undefined;

  const title = keys ? t(keys.title as Parameters<typeof t>[0]) : t("portfolioTitle");
  const description = keys ? t(keys.description as Parameters<typeof t>[0]) : t("portfolioDescription");

  return buildPageMetadata({
    locale,
    // Slugs are translated, so each locale's URL has to be resolved from the
    // project itself — the same slug does not exist in the other language.
    href: (l) => (project ? projectHref(project, l) : { pathname: "/projects/[slug]", params: { slug } }),
    title,
    description,
    image: project?.ogImage ?? "/og/default.png",
    type: "article",
  });
}

export async function generateStaticParams() {
  // Each locale is prerendered under its own translated slug.
  return projects.flatMap((project) =>
    routing.locales.map((locale) => ({
      locale,
      slug: projectSlug(project, locale),
    }))
  );
}

export default async function ProjectCasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = projectByLocalizedSlug(slug, locale);
  if (!project) notFound();

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const tHeader = await getTranslations({ locale, namespace: "Header" });
  const tPortfolio = await getTranslations({ locale, namespace: "Portfolio" });
  const keys = metaKeyById[project.id];

  const url = localizedUrl(locale, projectHref(project, locale));
  const title = keys ? t(keys.title as Parameters<typeof t>[0]) : t("portfolioTitle");
  const description = keys
    ? t(keys.description as Parameters<typeof t>[0])
    : t("portfolioDescription");

  const schema = jsonLdGraph(
    {
      "@type": "CreativeWork",
      "@id": `${url}#project`,
      url,
      name: tPortfolio(project.titleKey as Parameters<typeof tPortfolio>[0]),
      headline: title,
      description,
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
      { name: tPortfolio(project.titleKey as Parameters<typeof tPortfolio>[0]), url },
    ])
  );

  return (
    <>
      <ProjectCaseClient />
      <JsonLd data={schema} />
    </>
  );
}
