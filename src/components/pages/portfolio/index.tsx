import { Reveal } from "@/components/ui/reveal";
import { ExternalLink, Github } from "lucide-react";
import { getTranslations } from "next-intl/server";

const Projects = async () => {
  const t = await getTranslations("Portfolio")
  const projects = [
    {
      title: t("project1.title"),
      desc: t("project1.desc"),
      techs: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind CSS"],
      github: "#", demo: "#",
    },
    {
      title: t("project2.title"),
      desc: t("project2.desc"),
      techs: ["Next.js", "GraphQL", "MongoDB", "Framer Motion"],
      github: "#", demo: "#",
    },
    {
      title: t("project3.title"),
      desc: t("project3.desc"),
      techs: ["React", "NestJS", "PostgreSQL", "Docker", "AWS"],
      github: "#", demo: "#",
    },
    {
      title: t("project4.title"),
      desc: t("project4.desc"),
      techs: ["Next.js", "TypeScript", "Tailwind CSS", "MDX"],
      github: "#", demo: "#",
    },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <Reveal
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("title")}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t("subtitle")}</p>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full mt-4" />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {projects.map((project, i) => (
            <Reveal
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card-portfolio group"
            >
              <div className="h-48 bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center border-b border-border">
                <span className="text-muted-foreground/40 text-sm font-medium">{t("image")}</span>
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-accent transition-colors duration-200">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{project.desc}</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.techs.map((tech) => (
                    <span key={tech} className="tech-tag">{tech}</span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <a href={project.github} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200">
                    <Github className="w-4 h-4" /> {t("code")}
                  </a>
                  <a href={project.demo} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200">
                    <ExternalLink className="w-4 h-4" /> {t("demo")}
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;