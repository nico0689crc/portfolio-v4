import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/routing";
import { Search, PenTool, Code2, Rocket, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

const HowWeWork = async () => {
  const t = await getTranslations("Home.howWeWork");

  const phases = [
    { icon: Search, title: t("discovery.title"), desc: t("discovery.desc") },
    { icon: PenTool, title: t("design.title"), desc: t("design.desc") },
    { icon: Code2, title: t("development.title"), desc: t("development.desc") },
    { icon: Rocket, title: t("delivery.title"), desc: t("delivery.desc") },
  ];

  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto">
        <Reveal
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("title")}</h2>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full mb-6" />
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t("subtitle")}</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {phases.map((p, i) => (
            <Reveal
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative p-6 rounded-xl border border-border bg-background hover:border-accent/40 hover:shadow-card-hover transition-all duration-300"
            >
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-accent/10 text-accent">
                <p.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </Reveal>
          ))}
        </div>

        <Reveal
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-amber-hover transition-colors duration-200"
          >
            {t("cta")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
};

export default HowWeWork;
