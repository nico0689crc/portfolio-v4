"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { StaticImageData } from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { projects, type Category } from "@/data/projectsData";

const ImageCarousel = ({ images }: { images: (string | StaticImageData)[] }) => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  const currentImage = images[current];
  const src = typeof currentImage === "string" ? currentImage : currentImage.src;

  return (
    <div className="relative h-52 overflow-hidden bg-muted">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={src}
          alt="Project screenshot"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors opacity-0 group-hover:opacity-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors opacity-0 group-hover:opacity-100">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-accent" : "bg-background/60"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Projects = () => {
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("projects.title")}</h2>
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
                key={project.slug}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="card-portfolio group"
              >
                <ImageCarousel images={project.images} />
                <div className="p-6">
                  <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-accent transition-colors duration-200">
                    {t(project.titleKey)}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{t(project.descKey)}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.techs.map((tech) => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <a href={project.github} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200">
                        <Github className="w-4 h-4" /> {t("projects.code")}
                      </a>
                      <a href={project.demo} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200">
                        <ExternalLink className="w-4 h-4" /> {t("projects.demo")}
                      </a>
                    </div>
                    <Link
                      href={{
                        pathname: "/projects/[slug]",
                        params: { slug: project.slug }
                      }}
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