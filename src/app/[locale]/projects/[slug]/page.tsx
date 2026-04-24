import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { projects } from "@/data/projectsData";
import ProjectCaseClient from "./ProjectCaseClient";

const BASE_URL = "https://nicolasarielfernandez.com";

const metaKeyBySlug: Record<string, { title: string; description: string }> = {
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
  const project = projects.find((p) => p.slug === slug);
  const keys = metaKeyBySlug[slug];

  const title = keys ? t(keys.title as Parameters<typeof t>[0]) : t("portfolioTitle");
  const description = keys ? t(keys.description as Parameters<typeof t>[0]) : t("portfolioDescription");
  const ogImage = project?.ogImage ?? "/profile-picture.webp";
  const url = `${BASE_URL}/${locale}/projects/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${BASE_URL}/en/projects/${slug}`,
        es: `${BASE_URL}/es/projects/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      locale,
      url,
      title,
      description,
      siteName: "Nicolás Ariel Fernández",
      images: [
        {
          url: `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${BASE_URL}${ogImage}`],
    },
  };
}

export async function generateStaticParams() {
  return projects.flatMap((p) => [
    { locale: "en", slug: p.slug },
    { locale: "es", slug: p.slug },
  ]);
}

export default async function ProjectCasePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ProjectCaseClient />;
}
