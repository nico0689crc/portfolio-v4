import { Reveal } from "@/components/ui/reveal";
import { getTranslations } from "next-intl/server";
import { Download } from "lucide-react";

const ShortAbout = async () => {
  const t = await getTranslations("Home.shortAbout");

  return (
    <section className="py-20 bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-accent/5 skew-y-3 transform -translate-y-12 z-0" />
      <div className="container mx-auto px-4 relative z-10">
        <Reveal
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-6">
            {t("title")}
          </h2>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full mb-8" />
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
            {t("desc")}
          </p>
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
      </div>
    </section>
  );
};

export default ShortAbout;
