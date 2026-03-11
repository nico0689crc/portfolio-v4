import { Reveal } from "@/components/ui/reveal";
import { Mail, Linkedin, Github, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import ContactForm from "./contact-form";

const Contact = async () => {
  const t = await getTranslations("Contact");
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto max-w-4xl">
        <Reveal
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("desc")}
          </p>
          <div className="w-12 h-1 bg-accent mx-auto rounded-full mt-6" />
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Information */}
          <div className="flex flex-col gap-6">
            {[
              {
                icon: Mail,
                label: "Email",
                value: "contacto@nicolasarielfernandez.com",
                href: "mailto:contacto@nicolasarielfernandez.com",
              },
              {
                icon: Linkedin,
                label: "LinkedIn",
                value: "nicolas-fernandez",
                href: "https://www.linkedin.com/in/nicolas-ariel-fernandez",
              },
              {
                icon: Github,
                label: "GitHub",
                value: "nicolas-fernandez",
                href: "https://github.com/nico0689crc",
              },
            ].map((item, i) => (
              <Reveal
                as="a"
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:border-accent/40 hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <span className="block font-display font-bold text-foreground">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <ContactForm />
        </div>

        <Reveal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 mt-12 text-muted-foreground"
        >
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-sm">Argentina · {t("hero.badge")}</span>
        </Reveal>
      </div>
    </section >
  );
};

export default Contact;