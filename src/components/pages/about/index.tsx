import { motion } from "framer-motion";
import { Globe, ChefHat, Code, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/reveal";

const About = async () => {
  const t = await getTranslations("About");

  const cards = [
    { icon: Code, title: t("card1.title"), desc: t("card1.desc") },
    { icon: Globe, title: t("card2.title"), desc: t("card2.desc") },
    { icon: ChefHat, title: t("card3.title"), desc: t("card3.desc") },
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
            <p className="text-lg text-foreground/80 leading-relaxed">{t("about.p3")}</p>
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
      </div>
    </section>
  );
};

export default About;
