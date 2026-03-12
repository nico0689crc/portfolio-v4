import { motion } from "framer-motion";
import { PenTool, Lightbulb, Code, ArrowRight, Download } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const About = async () => {
  const t = await getTranslations("About");

  const cards = [
    { icon: Code, title: t("card1.title"), desc: t("card1.desc") },
    { icon: PenTool, title: t("card2.title"), desc: t("card2.desc") },
    { icon: Lightbulb, title: t("card3.title"), desc: t("card3.desc") },
  ];

  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <Reveal
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          <Reveal
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-foreground/80 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: t.raw("about.p1") }} />
            <p className="text-lg text-foreground/80 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: t.raw("about.p2") }} />
            <p className="text-lg text-foreground/80 leading-relaxed mb-8">{t("about.p3")}</p>
            
            <a
              href={t("cvUrl")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity duration-200 text-nowrap"
            >
              <Download className="w-5 h-5" />
              {t("cv")}
            </a>
          </Reveal>

          <Reveal
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {cards.map((item, i) => (
              <Reveal
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="flex gap-4 p-5 rounded-xl border border-border bg-card hover:border-accent/30 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground mb-1 text-sm">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </Reveal>
            ))}

            <Reveal
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all duration-200 mt-4"
              >
                {t("cta")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </Reveal>
        </div>

        {/* Work Experience Section */}
        <div className="mt-32 max-w-4xl mx-auto">
          <Reveal
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {t("experience.title")}
            </h2>
            <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
          </Reveal>

          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
            {(t.raw("experience.jobs") as Array<{role: string, company: string, date: string, desc: string, tech: string}>).map((job, i: number) => (
              <Reveal
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-accent/20 text-accent shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                </div>

                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-border bg-card hover:border-accent/30 transition-colors shadow-sm">
                  <div className="flex flex-col mb-2">
                    <span className="text-accent font-medium text-sm mb-1">{job.date}</span>
                    <h3 className="font-display font-bold text-lg text-foreground">{job.role}</h3>
                    <span className="text-muted-foreground text-sm font-medium">{job.company}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                    {job.desc}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                    {job.tech.split(", ").map((tech: string) => (
                      <span key={tech} className="text-xs font-medium px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32 max-w-3xl mx-auto">
          <Reveal
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              {t("faq.title")}
            </h2>
            <p className="text-muted-foreground mb-6">{t("faq.subtitle")}</p>
            <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
          </Reveal>

          <Reveal
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion className="w-full">
              {t.raw("faq.questions").map((item: {q: string, a: string}, index: number) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-border">
                  <AccordionTrigger className="text-left font-display text-foreground hover:text-accent font-semibold text-lg transition-colors">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base pt-2 pb-6">
                    <span dangerouslySetInnerHTML={{ __html: item.a }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>

      </div>
    </section>
  );
};

export default About;
