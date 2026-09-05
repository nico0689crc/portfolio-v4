"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { storageUrl } from "@/lib/content/storage";
import type { ProjectImage, ProjectSummary } from "@/lib/content/types";
import { trackEvent } from "@/lib/analytics";

/** Filter buttons are UI, not content: the set is fixed by the design. */
type Category = "all" | "fullstack" | "ux-ui" | "wordpress";

const ImageCarousel = ({ images, projectName }: { images: ProjectImage[]; projectName: string }) => {
  const [current, setCurrent] = useState(0);
  const image = images[current];

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  if (!image) return null;

  return (
    <div className="relative aspect-video overflow-hidden bg-muted group/carousel">
      <Image
        src={storageUrl(image.storagePath)}
        alt={image.alt ?? `${projectName} — ${current + 1}/${images.length}`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        {...(image.blurDataUrl
          ? { placeholder: "blur" as const, blurDataURL: image.blurDataUrl }
          : {})}
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition opacity-0 group-hover/carousel:opacity-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition opacity-0 group-hover/carousel:opacity-100">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition ${i === current ? "bg-accent scale-110" : "bg-background/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Projects = ({ projects }: { projects: ProjectSummary[] }) => {
  const t = useTranslations("Portfolio");
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const categories: { key: Category; label: string }[] = [
    { key: "all", label: t("projects.filter.all") },
    { key: "fullstack", label: "Full Stack" },
    { key: "ux-ui", label: "UX/UI" },
    { key: "wordpress", label: "WordPress" },
  ];

  const filtered = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("projects.title")}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">{t("projects.subtitle")}</p>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full mt-4" />
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${activeCategory === cat.key
                ? "bg-accent text-accent-foreground border-accent shadow-md"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <motion.div layout className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.key}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="card-portfolio group"
              >
                <ImageCarousel images={project.images} projectName={project.title} />
                <div className="p-6">
                  <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-accent transition-colors duration-200">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.techs.map((tech) => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      {project.links.github && (
                        <a href={project.links.github} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent({ name: "project_link_click", params: { project: project.key, link_type: "github", source: "portfolio" } })} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200">
                          <Github className="w-4 h-4" /> {t("projects.code")}
                        </a>
                      )}
                      {/* Guarded: the static version rendered this anchor
                          unconditionally, so a project without a demo shipped an
                          <a> with an undefined href. */}
                      {project.links.demo && (
                        <a href={project.links.demo} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent({ name: "project_link_click", params: { project: project.key, link_type: "demo", source: "portfolio" } })} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200">
                          <ExternalLink className="w-4 h-4" /> {t("projects.demo")}
                        </a>
                      )}
                    </div>
                    <Link
                      href={{ pathname: "/projects/[slug]", params: { slug: project.slug } }}
                      onClick={() => trackEvent({ name: "case_study_open", params: { project: project.key } })}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline transition-colors duration-200"
                    >
                      {t("projects.viewCase")} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
