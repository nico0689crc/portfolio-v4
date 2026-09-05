"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Users,
  Target,
  Lightbulb,
  Pencil,
  FlaskConical,
  Rocket,
  ChevronLeft,
  ChevronRight,
  PenLine,
} from "lucide-react";
import { CanvaIcon, FigJamIcon } from "@/components/ui/icons";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { storageUrl } from "@/lib/content/storage";
import type { ProjectDetail, ProjectImage } from "@/lib/content/types";
import { trackEvent, type ProjectLinkType } from "@/lib/analytics";
import { Link } from "@/i18n/routing";

const MotionImage = motion(Image);

type CaseLink = {
  type: ProjectLinkType;
  href?: string;
  icon: React.ElementType;
  label: string;
  className: string;
};

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

/**
 * Phases are ordered content rows, but their icons are presentation. Keying the
 * map by the phase slug means adding a sixth phase in the backoffice does not
 * silently shift every icon down one, the way an index-based list would.
 */
const PHASE_ICONS: Record<string, React.ElementType> = {
  empathize: Users,
  define: Target,
  ideate: Lightbulb,
  prototype: Pencil,
  test: FlaskConical,
};

const CaseImageGallery = ({
  images,
  projectName,
}: {
  images: ProjectImage[];
  projectName: string;
}) => {
  const [current, setCurrent] = useState(0);
  const image = images[current];

  if (!image) return null;

  return (
    <div className="relative rounded-xl overflow-hidden aspect-video bg-muted group">
      <AnimatePresence mode="wait">
        <MotionImage
          key={current}
          src={storageUrl(image.storagePath)}
          // Falls back to the positional label the static version always used;
          // real alt text comes from the backoffice once it is filled in.
          alt={image.alt ?? `${projectName} — ${current + 1}/${images.length}`}
          fill
          sizes="(max-width: 896px) 100vw, 896px"
          {...(image.blurDataUrl
            ? { placeholder: "blur" as const, blurDataURL: image.blurDataUrl }
            : {})}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="object-cover"
        />
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition opacity-0 group-hover:opacity-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full transition ${i === current ? "bg-accent scale-110" : "bg-background/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PhaseCard = ({ icon: Icon, phase, title, children }: { icon: React.ElementType; phase: string; title: string; children: React.ReactNode }) => (
  <motion.div {...fade} className="relative">
    <div className="flex items-start gap-5">
      <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-1 block">{phase}</span>
        <h3 className="font-display text-xl font-bold text-foreground mb-3">{title}</h3>
        <div className="text-muted-foreground text-sm leading-relaxed space-y-3">{children}</div>
      </div>
    </div>
  </motion.div>
);

/**
 * The note is a full sentence plus the substring inside it that should become a
 * link, so it is split rather than stored as markup — the editor writes prose,
 * not HTML, and nothing here ever renders raw input.
 */
const CaseNote = ({ html, url, linkText }: { html: string; url: string | null; linkText: string | null }) => {
  if (!url || !linkText) {
    return <p className="text-sm text-muted-foreground mb-6">{html}</p>;
  }

  const [before, ...rest] = html.split(linkText);

  return (
    <p className="text-sm text-muted-foreground mb-6">
      {before}
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:opacity-80 transition">
        {linkText}
      </a>
      {rest.join(linkText)}
    </p>
  );
};

const ProjectCaseClient = ({ project }: { project: ProjectDetail }) => {
  const t = useTranslations("Portfolio");
  const cs = project.caseStudy;

  const links = ([
    { type: "github", href: project.links.github, icon: Github, label: t("projects.code"), className: "bg-foreground text-background" },
    { type: "demo", href: project.links.demo, icon: ExternalLink, label: t("projects.demo"), className: "bg-accent text-accent-foreground" },
    { type: "canva", href: project.links.canva, icon: CanvaIcon, label: t("projects.canva"), className: "border border-border text-foreground hover:bg-muted" },
    { type: "figjam", href: project.links.figjam, icon: FigJamIcon, label: t("projects.figjam"), className: "border border-border text-foreground hover:bg-muted" },
    { type: "lofi", href: project.links.lofi, icon: PenLine, label: t("projects.lofi"), className: "border border-border text-foreground hover:bg-muted" },
  ] satisfies CaseLink[]).filter((link) => link.href);

  const facts = [
    { key: "role", value: cs?.role },
    { key: "duration", value: cs?.duration },
    { key: "team", value: cs?.team },
  ].filter((fact) => fact.value);

  return (
    <div className="pt-24">
      {/* Hero del caso */}
      <section className="section-padding pb-12">
        <div className="container mx-auto max-w-4xl">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("case.back")}
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">{t("case.study")}</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{project.title}</h1>
            {cs?.overview && <p className="text-lg text-muted-foreground mb-3">{cs.overview}</p>}
            {cs?.noteHtml && <CaseNote html={cs.noteHtml} url={cs.noteUrl} linkText={cs.noteLinkText} />}

            <div className="flex flex-wrap gap-2 mb-6">
              {project.techs.map((tech) => (
                <span key={tech} className="tech-tag">{tech}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {links.map(({ type, href, icon: Icon, label, className }) => (
                <a
                  key={type}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent({ name: "project_link_click", params: { project: project.key, link_type: type, source: "case_study" } })}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition hover:opacity-90 ${className}`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Galería */}
      {project.images.length > 0 && (
        <section className="px-6 md:px-12 lg:px-24 pb-16">
          <div className="container mx-auto max-w-4xl">
            <motion.div {...fade}>
              <CaseImageGallery images={project.images} projectName={project.title} />
            </motion.div>
          </div>
        </section>
      )}

      {/* Info cards: Rol, Duración, Equipo */}
      {facts.length > 0 && (
        <section className="px-6 md:px-12 lg:px-24 pb-16">
          <div className="container mx-auto max-w-4xl">
            <div className="grid sm:grid-cols-3 gap-4">
              {facts.map((fact) => (
                <motion.div key={fact.key} {...fade} className="bg-card border border-border rounded-xl p-5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-1 block">{t(`case.${fact.key}` as Parameters<typeof t>[0])}</span>
                  <p className="text-foreground font-medium text-sm">{fact.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contexto y Problema */}
      {(cs?.context || cs?.problem) && (
        <section className="px-6 md:px-12 lg:px-24 pb-16">
          <div className="container mx-auto max-w-4xl">
            {cs?.context && (
              <motion.div {...fade}>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">{t("case.context")}</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{cs.context}</p>
              </motion.div>
            )}
            {cs?.problem && (
              <motion.div {...fade} className="bg-accent/5 border border-accent/20 rounded-xl p-6 mt-4">
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{t("case.problem")}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{cs.problem}</p>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Proceso */}
      {cs && cs.phases.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <motion.div {...fade} className="text-center mb-14">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{t("case.process")}</h2>
              {cs.processDesc && <p className="text-muted-foreground max-w-lg mx-auto">{cs.processDesc}</p>}
              <div className="w-12 h-1 bg-accent mx-auto rounded-full mt-4" />
            </motion.div>

            <div className="space-y-12">
              {cs.phases.map((phase) => (
                <PhaseCard
                  key={phase.slug}
                  icon={PHASE_ICONS[phase.slug] ?? Lightbulb}
                  phase={phase.label ?? ""}
                  title={phase.title ?? ""}
                >
                  <p>{phase.body}</p>
                </PhaseCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Resultados */}
      {cs?.results && (
        <section className="section-padding">
          <div className="container mx-auto max-w-4xl">
            <motion.div {...fade}>
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="w-6 h-6 text-accent" />
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{t("case.results")}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-8">{cs.results}</p>

              {cs.metrics.length > 0 && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {cs.metrics.map((metric) => (
                    <motion.div key={metric.label} {...fade} className="bg-card border border-border rounded-xl p-6 text-center">
                      <span className="font-display text-3xl font-bold text-accent block mb-1">{metric.value}</span>
                      <span className="text-muted-foreground text-sm">{metric.label}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Aprendizajes */}
      {cs?.learnings && (
        <section className="px-6 md:px-12 lg:px-24 pb-20">
          <div className="container mx-auto max-w-4xl">
            <motion.div {...fade} className="bg-card border border-border rounded-xl p-8">
              <h2 className="font-display text-xl font-bold text-foreground mb-3">{t("case.learnings")}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{cs.learnings}</p>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA siguiente proyecto */}
      <section className="px-6 md:px-12 lg:px-24 pb-20">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div {...fade}>
            <Link href="/portfolio" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-accent-foreground font-medium hover:opacity-90 transition">
              {t("case.seeAll")}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProjectCaseClient;
