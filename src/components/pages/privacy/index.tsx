import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/reveal";

/**
 * La política de privacidad.
 *
 * Las secciones se listan acá y no se recorren desde el JSON de mensajes porque
 * el orden es parte del texto: primero qué se recoge, después para qué, después
 * con quién. Una lista derivada de las claves lo dejaría a merced de cómo
 * quedaron ordenadas en la base.
 */
const SECTIONS = ["use", "sharing", "retention", "rights", "contact", "changes"] as const;

const Privacy = async ({ locale }: { locale: string }) => {
  const t = await getTranslations({ locale, namespace: "Privacy" });

  return (
    <section className="section-padding bg-background pt-32">
      <div className="container mx-auto max-w-2xl">
        <Reveal
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{t("title")}</h1>
          <p className="text-muted-foreground text-sm mb-2">{t("updated")}</p>
          <div className="w-12 h-1 bg-accent rounded-full mb-8" />

          <p className="text-muted-foreground leading-relaxed mb-10">{t("intro")}</p>

          <h2 className="font-display text-xl font-bold text-foreground mb-3">{t("dataTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{t("dataIntro")}</p>
          <ul className="flex flex-col gap-4 mb-10">
            {(["dataContact", "dataAnalytics", "dataPreferences"] as const).map((key) => (
              <li key={key} className="border-l-2 border-accent/40 pl-4 text-muted-foreground leading-relaxed">
                {t(key)}
              </li>
            ))}
          </ul>

          {SECTIONS.map((key) => (
            <div key={key} className="mb-10 last:mb-0">
              <h2 className="font-display text-xl font-bold text-foreground mb-3">{t(`${key}Title`)}</h2>
              <p className="text-muted-foreground leading-relaxed">{t(`${key}Body`)}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default Privacy;
