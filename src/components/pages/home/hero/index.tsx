import { Reveal } from "@/components/ui/reveal";
import { Link } from "@/i18n/routing";
import { ArrowDown, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import profilePhoto from "@/assets/profile-picture.webp";
import Image from "next/image";


export default function Hero() {
  const t = useTranslations("Home");
  return (
    <section className="section-dark min-h-screen flex items-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      <div className="absolute top-20 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />

      <div className="container mx-auto relative z-10 px-6 md:px-12 lg:px-24">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-20">
          <Reveal
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 max-w-2xl"
          >
            <Reveal
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {t("hero.badge")}
            </Reveal>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-primary-foreground">
              {t("hero.title.1")}{" "}
              <span className="text-accent">{t("hero.title.2")}</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-xl mb-10 leading-relaxed">
              {t("hero.subtitle")}{" "}
              <span className="text-primary-foreground/50">{t("hero.location")}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Reveal whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-amber-hover transition-colors duration-200"
                >
                  {t("hero.cta.projects")}
                  <ArrowDown className="w-4 h-4" />
                </Link>
              </Reveal>
              <Reveal whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary-foreground/20 text-primary-foreground font-semibold rounded-lg hover:bg-primary-foreground/5 transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  {t("hero.cta.contact")}
                </Link>
              </Reveal>
            </div>
          </Reveal>

          {/* Profile Photo */}
          <Reveal
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            className="flex justify-center flex-1"
          >
            <div className="relative">
              <div className="w-56 h-56 md:w-100 md:h-100 rounded-full overflow-hidden border-4 border-accent/30 shadow-2xl">
                <Image
                  src={profilePhoto}
                  alt="Nicolás Ariel Fernández"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-accent/20 rounded-full blur-xl" />
              <div className="absolute -top-2 -left-2 w-16 h-16 bg-accent/15 rounded-full blur-lg" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};



