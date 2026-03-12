import { useTranslations } from 'next-intl';
import { Github, Linkedin, Mail, Heart } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';

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
            {/* Social links */}
            {[
              { icon: Linkedin, href: "https://www.linkedin.com/in/nicolas-ariel-fernandez", label: "LinkedIn" },
              { icon: Github, href: "https://github.com/nico0689crc", label: "GitHub" },
              { icon: Mail, href: "mailto:contacto@nicolasarielfernandez.com", label: "Email" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "[&_svg:not([class*='size-'])]:size-5 px-4 py-2"
                )}
              >
                <social.icon />
              </a>
            ))}

          </div>
          <Link 
            href="mailto:contacto@nicolasarielfernandez.com"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            <Mail className="w-5 h-5" />
            {t("email")}
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
