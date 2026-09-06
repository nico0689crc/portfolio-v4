import { getLocale, getTranslations } from "next-intl/server";
import { Download, ArrowRight, Briefcase, GraduationCap, Award, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/ui/reveal";
import CvDownload from "./CvDownload";
import { getResumeHighlights } from "@/lib/content";
import type { CvData } from "@/lib/cv-schema";

/**
 * Everything rendered here comes from the database via `cv`, so the page and
 * the JSON-LD it ships with are built from one read and cannot disagree.
 */
const Resume = async ({ cv }: { cv: CvData }) => {
  const locale = await getLocale();
  const t = await getTranslations("Resume");

  const highlights = await getResumeHighlights(locale);

  const categories = cv.skillCategories.map((category) => ({
    title: category.label,
    skills: category.skills.map((skill) => skill.name),
  }));

  const secondaryLocale = locale === "es" ? "en" : "es";
  const primaryCv = cv.cvFiles[locale] ?? cv.cvFiles.en;
  // Deriva del corto en lugar de vivir en su propio ajuste: son el mismo
  // documento con más detalle, y dos rutas configurables por separado
  // terminarían apuntando a idiomas distintos.
  const extendedCv = primaryCv.replace(/\.pdf$/, "_Extended.pdf");
  const extraRoles = cv.experiences.reduce((total, job) => total + job.roles.length, 0);
  const secondaryCv = cv.cvFiles[secondaryLocale] ?? cv.cvFiles.en;
  const secondaryExtendedCv = secondaryCv.replace(/\.pdf$/, "_Extended.pdf");

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <Reveal direction="up" distance={30} duration={0.6} className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-accent font-semibold text-lg mb-6">{t("subtitle")}</p>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full mb-8" />
          <p className="text-lg text-foreground/80 leading-relaxed mb-10">{t("intro", { years: cv.yearsOfExperience })}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CvDownload
              label={locale === "es" ? t("downloadEs") : t("downloadEn")}
              locale={locale}
              shortHref={primaryCv}
              extendedHref={extraRoles > 0 ? extendedCv : null}
              labels={{ short: t("versionShort"), extended: t("versionExtended"), pick: t("versionPick") }}
            />
            <CvDownload
              label={secondaryLocale === "es" ? t("downloadEs") : t("downloadEn")}
              locale={secondaryLocale}
              shortHref={secondaryCv}
              extendedHref={extraRoles > 0 ? secondaryExtendedCv : null}
              labels={{ short: t("versionShort"), extended: t("versionExtended"), pick: t("versionPick") }}
              variant="outline"
            />
          </div>

        </Reveal>

        {/* Highlights */}
        <Reveal direction="up" distance={20} duration={0.6} className="max-w-4xl mx-auto mb-28">
          <h2 className="sr-only">{t("highlightsTitle")}</h2>
          <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="p-5 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors duration-300"
              >
                <dt className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                  {item.label}
                </dt>
                {/* `{years}` se sustituye acá: el destacado es contenido
                    editable, pero la cifra sale de las fechas para que no pueda
                    contradecir al resto del CV. */}
                <dd className="text-foreground font-medium">
                  {item.value.replace("{years}", String(cv.yearsOfExperience))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Experience */}
        <div className="max-w-4xl mx-auto mb-28">
          <Reveal direction="up" distance={30} duration={0.6} className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {t("experienceTitle")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("experienceSubtitle")}</p>
            <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
          </Reveal>

          <ol className="space-y-5">
            {cv.experiences.map((job, i) => (
              <Reveal
                key={job.id}
                direction="up"
                distance={20}
                duration={0.5}
                delay={i * 0.08}
                as="li"
                className="flex gap-5 p-6 rounded-2xl border border-border bg-card hover:border-accent/30 transition-colors shadow-sm"
              >
                <div className="hidden sm:flex w-11 h-11 shrink-0 rounded-lg bg-accent/10 items-center justify-center">
                  <Briefcase className="w-5 h-5 text-accent" />
                </div>
                <div className="min-w-0">
                  {/* `dateLabel` es prosa editorial —"Marzo 2025 - Actualidad"—
                      así que la fecha legible por máquina va en el atributo. Sin
                      esto un parser tiene que interpretar el texto, y lo hace
                      distinto en cada idioma. */}
                  <time
                    dateTime={job.startDate ?? undefined}
                    className="text-accent font-medium text-sm"
                  >
                    {job.dateLabel}
                  </time>
                  <h3 className="font-display font-bold text-lg text-foreground mt-1">{job.role}</h3>
                  <p className="text-muted-foreground text-sm font-medium">{job.company}</p>
                  {/* `details` nativo y no un componente con estado: no
                      necesita JavaScript, es navegable con teclado y su
                      contenido queda en el DOM, así que un buscador lo indexa
                      aunque esté plegado. */}
                  {job.roles.length > 0 && (
                    <details className="mt-4 group/roles">
                      {/* Con aspecto de botón y no de enlace: un control que se
                          despliega tiene que verse como algo en lo que se hace
                          clic. Estilado como texto suelto pasaba desapercibido
                          entre el resto de la tarjeta. */}
                      <summary className="inline-flex items-center gap-2 cursor-pointer select-none rounded-lg border border-accent/30 bg-accent/5 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 list-none marker:content-['']">
                        <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-open/roles:rotate-90" />
                        {t("rolesToggle", { count: job.roles.length })}
                      </summary>

                      <ol className="mt-4 space-y-3 border-l border-border pl-4">
                        {job.roles.map((role) => (
                          <li key={role.id}>
                            <p className="text-xs text-muted-foreground">{role.dateLabel}</p>
                            <p className="font-medium text-sm text-foreground">{role.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {role.organization}
                              {role.location ? ` · ${role.location}` : ""}
                            </p>
                            {role.description && (
                              <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                            )}
                          </li>
                        ))}
                      </ol>

                      <a
                        href={extendedCv}
                        className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-accent hover:underline"
                      >
                        <Download className="w-4 h-4" /> {t("rolesDownload")}
                      </a>
                    </details>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.techs.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-medium px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        {/* Skills */}
        <div className="max-w-5xl mx-auto mb-28">
          <Reveal direction="up" distance={30} duration={0.6} className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {t("skillsTitle")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("skillsSubtitle")}</p>
            <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Reveal
                key={cat.title}
                direction="up"
                distance={20}
                duration={0.5}
                delay={i * 0.06}
                className="p-6 rounded-xl border border-border bg-card"
              >
                <h3 className="font-display font-bold text-lg text-foreground mb-4">{cat.title}</h3>
                <ul className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <li
                      key={skill}
                      className="px-3 py-1.5 rounded-full text-sm font-medium border border-border text-muted-foreground"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="max-w-4xl mx-auto mb-28">
          <Reveal direction="up" distance={30} duration={0.6} className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {t("educationTitle")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("educationSubtitle")}</p>
            <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
          </Reveal>

          <ol className="space-y-5">
            {cv.education.map((item, i) => {
              return (
                <Reveal
                  key={item.id}
                  direction="up"
                  distance={20}
                  duration={0.5}
                  delay={i * 0.08}
                  as="li"
                  className="flex gap-5 p-6 rounded-2xl border border-border bg-card hover:border-accent/30 transition-colors shadow-sm"
                >
                  <div className="hidden sm:flex w-11 h-11 shrink-0 rounded-lg bg-accent/10 items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <time
                      dateTime={item.startDate ?? undefined}
                      className="text-accent font-medium text-sm"
                    >
                      {item.dateLabel}
                    </time>
                    <h3 className="font-display font-bold text-lg text-foreground mt-1">
                      {item.degree}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium">
                      {item.institution}{item.location ? ` · ${item.location}` : ""}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>

        {/* Certifications */}
        <div className="max-w-4xl mx-auto mb-28">
          <Reveal direction="up" distance={30} duration={0.6} className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {t("certificationsTitle")}
            </h2>
            <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
          </Reveal>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cv.certifications.map((cert, i) => {
              return (
                <Reveal
                  key={cert.id}
                  direction="up"
                  distance={20}
                  duration={0.5}
                  delay={i * 0.06}
                  as="li"
                  className="p-5 rounded-xl border border-border bg-card flex gap-4"
                >
                  <Award className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground text-sm leading-snug">{cert.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cert.issuer} · {cert.year}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
          <p className="text-center text-sm text-muted-foreground mt-8">
            {t("certificationsNote")}
          </p>
        </div>

        {/* CTA */}
        <Reveal
          direction="up"
          distance={20}
          duration={0.6}
          className="max-w-2xl mx-auto text-center p-10 rounded-2xl border border-border bg-card"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t("ctaTitle")}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">{t("ctaDesc")}</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            {t("ctaButton")} <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default Resume;
