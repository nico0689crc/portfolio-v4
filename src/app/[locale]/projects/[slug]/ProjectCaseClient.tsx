"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Github, Users, Target, Lightbulb, Pencil, FlaskConical, Rocket, ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { FigmaIcon, CanvaIcon, FigJamIcon } from "@/components/ui/icons";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { projects } from "@/data/projectsData";
import { Link } from "@/i18n/routing";
import { StaticImageData } from "next/image";
import Image from "next/image";

const MotionImage = motion(Image);

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

const CaseImageGallery = ({ images }: { images: (string | StaticImageData)[] }) => {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative rounded-xl overflow-hidden aspect-video bg-muted group">
      <AnimatePresence mode="wait">
        <MotionImage
          key={current}
          src={images[current]}
          alt="Project screenshot"
          fill
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

const ProjectCaseClient = () => {
  const { slug } = useParams<{ slug: string }>();
  const t = useTranslations("Portfolio");
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const c = (key: string) => t(`${project.casePrefix}.${key}`);
  // Uses project-specific key if it exists, otherwise falls back to global case.*
  const ct = (key: string) => {
    const projectVal = c(key);
    // next-intl returns the key path when missing — detect that
    return projectVal === `${project.casePrefix}.${key}` ? t(`case.${key}`) : projectVal;
  };

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
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{t(project.titleKey)}</h1>
            <p className="text-lg text-muted-foreground mb-3">{c("overview")}</p>
            {project.slug === "mexx-ux-redesign" && (() => {
              const note = c("diplomaNote");
              const url = c("diplomaUrl");
              const linkText = c("diplomaLinkText");
              const parts = note.split(linkText);
              return (
                <p className="text-sm text-muted-foreground mb-6">
                  {parts[0]}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:opacity-80 transition">
                    {linkText}
                  </a>
                  {parts[1]}
                </p>
              );
            })()}

            <div className="flex flex-wrap gap-2 mb-6">
              {project.techs.map((tech) => (
                <span key={tech} className="tech-tag">{tech}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition">
                  <Github className="w-4 h-4" /> {t("projects.code")}
                </a>
              )}
              {project.demo && (
                <a href={project.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition">
                  <ExternalLink className="w-4 h-4" /> {t("projects.demo")}
                </a>
              )}
              {project.canva && (
                <a href={project.canva} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
                  <CanvaIcon className="w-4 h-4" /> {t("projects.canva")}
                </a>
              )}
              {project.figjam && (
                <a href={project.figjam} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
                  <FigJamIcon className="w-4 h-4" /> {t("projects.figjam")}
                </a>
              )}
              {project.lofi && (
                <a href={project.lofi} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition">
                  <PenLine className="w-4 h-4" /> {t("projects.lofi")}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Galería */}
      <section className="px-6 md:px-12 lg:px-24 pb-16">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fade}>
            <CaseImageGallery images={project.images} />
          </motion.div>
        </div>
      </section>

      {/* Info cards: Rol, Duración, Equipo */}
      <section className="px-6 md:px-12 lg:px-24 pb-16">
        <div className="container mx-auto max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-4">
            {["role", "duration", "team"].map((key) => (
              <motion.div key={key} {...fade} className="bg-card border border-border rounded-xl p-5">
                <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-1 block">{t(`case.${key}`)}</span>
                <p className="text-foreground font-medium text-sm">{c(key)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contexto y Problema */}
      <section className="px-6 md:px-12 lg:px-24 pb-16">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fade}>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">{t("case.context")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{c("context")}</p>
          </motion.div>
          <motion.div {...fade} className="bg-accent/5 border border-accent/20 rounded-xl p-6 mt-4">
            <h3 className="font-display font-bold text-lg text-foreground mb-2">{t("case.problem")}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{c("problem")}</p>
          </motion.div>
        </div>
      </section>

      {/* Proceso */}
      <section className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fade} className="text-center mb-14">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">{t("case.process")}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">{ct("processDesc")}</p>
            <div className="w-12 h-1 bg-accent mx-auto rounded-full mt-4" />
          </motion.div>

          <div className="space-y-12">
            <PhaseCard icon={Users} phase={ct("phase1.label")} title={ct("phase1.title")}>
              <p>{c("empathize")}</p>
            </PhaseCard>

            <PhaseCard icon={Target} phase={ct("phase2.label")} title={ct("phase2.title")}>
              <p>{c("define")}</p>
            </PhaseCard>

            <PhaseCard icon={Lightbulb} phase={ct("phase3.label")} title={ct("phase3.title")}>
              <p>{c("ideate")}</p>
            </PhaseCard>

            <PhaseCard icon={Pencil} phase={ct("phase4.label")} title={ct("phase4.title")}>
              <p>{c("prototype")}</p>
            </PhaseCard>

            <PhaseCard icon={FlaskConical} phase={ct("phase5.label")} title={ct("phase5.title")}>
              <p>{c("test")}</p>
            </PhaseCard>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <section className="section-padding">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fade}>
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="w-6 h-6 text-accent" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{t("case.results")}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-8">{c("results")}</p>

            <div className="grid sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <motion.div key={i} {...fade} className="bg-card border border-border rounded-xl p-6 text-center">
                  <span className="font-display text-3xl font-bold text-accent block mb-1">{c(`metric${i}.value`)}</span>
                  <span className="text-muted-foreground text-sm">{c(`metric${i}.label`)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Aprendizajes */}
      <section className="px-6 md:px-12 lg:px-24 pb-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fade} className="bg-card border border-border rounded-xl p-8">
            <h2 className="font-display text-xl font-bold text-foreground mb-3">{t("case.learnings")}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{c("learnings")}</p>
          </motion.div>
        </div>
      </section>

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
