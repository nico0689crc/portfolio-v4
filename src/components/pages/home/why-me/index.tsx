import { Reveal } from "@/components/ui/reveal";
import { Lightbulb, Users, Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";

const WhyMe = async () => {
  const t = await getTranslations("Home");

  const reasons = [
    { icon: Lightbulb, title: t("why.ux.title"), desc: t("why.ux.desc") },
    { icon: Users, title: t("why.soft.title"), desc: t("why.soft.desc") },
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
          {reasons.map((r, i) => {
            const isHighlighted = i === 1; // Highlight the Soft Skills card (index 1)
            
            return (
              <Reveal
                key={r.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`text-center p-8 rounded-xl border bg-card transition-all duration-300 group ${
                  isHighlighted 
                    ? "border-accent shadow-lg shadow-accent/20 md:-translate-y-4 md:scale-105" 
                    : "border-border hover:border-accent/40 hover:shadow-card-hover"
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors duration-300 ${
                  isHighlighted ? "bg-accent text-accent-foreground" : "bg-accent/10 text-accent group-hover:bg-accent/20"
                }`}>
                  <r.icon className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground mb-3">{r.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{r.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyMe;