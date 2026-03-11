import { useTranslations } from 'next-intl';
import { Github, Linkedin, Mail, Heart } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="section-dark">
      <div className="section-padding container mx-auto">
        <Reveal
          delay={0}
          duration={0.6}
          direction="up"
          distance={30}
          margin="-100px"
          once={true}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
            {t("title")}
          </h2>
          <p className="text-primary-foreground/70 text-lg leading-relaxed mb-10">
            {t("desc")}
          </p>

          <div className="flex justify-center gap-6 mb-12">
            {[
              { icon: Linkedin, href: "https://linkedin.com/in/nicolas-fernandez", label: "LinkedIn" },
              { icon: Github, href: "https://github.com/nicolas-fernandez", label: "GitHub" },
              { icon: Mail, href: "mailto:contacto@nicolasfernandez.dev", label: "Email" },
            ].map((link) => (

              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                <Button variant="outline" size="lg" className="[&_svg:not([class*='size-'])]:size-5 px-4 py-2">
                  <link.icon />
                </Button>
              </Link>
            ))}
          </div>
          <Link href="mailto:contacto@nicolasfernandez.dev">
            <Button size="lg">
              <Mail className="w-5 h-5" />
              {t("email")}
            </Button>
          </Link>
        </Reveal>
      </div>

      <div className="border-t border-primary-foreground/10 py-6">
        <p className="text-center text-primary-foreground/40 flex items-center justify-center gap-1">
          {t("made")} <Heart className="w-3.5 h-3.5 text-accent" /> {t("by")} · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
