import { Reveal } from "@/components/ui/reveal";
import { Lightbulb, Zap, Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";

const WhyMe = async () => {
  const t = await getTranslations("Home");

  const reasons = [
    { icon: Lightbulb, title: t("why.ux.title"), desc: t("why.ux.desc") },
    { icon: Zap, title: t("why.pressure.title"), desc: t("why.pressure.desc") },
    { icon: Layers, title: t("why.fullstack.title"), desc: t("why.fullstack.desc") },
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{t("why.title")}</h2>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {reasons.map((r, i) => (
            <Reveal
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="text-center p-8 rounded-xl border border-border bg-card hover:border-accent/40 hover:shadow-card-hover transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-accent/20 transition-colors duration-300">
                <r.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-3">{r.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{r.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyMe;