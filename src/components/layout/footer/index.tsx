import { useTranslations } from 'next-intl';
import { Github, Linkedin, Mail, Heart } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import Link from 'next/link';
import { Link as LocalizedLink } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { cn } from '@/lib/utils';
import { TrackedLink } from '@/components/analytics/tracked-link';
import type { AnalyticsEvent } from '@/lib/analytics';

type SocialNetwork = Extract<AnalyticsEvent, { name: 'social_click' }>['params']['network'];

const SOCIALS: Array<{ icon: typeof Linkedin; href: string; label: string; network: SocialNetwork }> = [
  { icon: Linkedin, href: 'https://www.linkedin.com/in/nicolas-ariel-fernandez', label: 'LinkedIn', network: 'linkedin' },
  { icon: Github, href: 'https://github.com/nico0689crc', label: 'GitHub', network: 'github' },
  { icon: Mail, href: 'mailto:contacto@nicolasarielfernandez.com', label: 'Email', network: 'email' },
];

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
            {SOCIALS.map((social) => (
              <TrackedLink
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                event={{ name: "social_click", params: { network: social.network } }}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "[&_svg:not([class*='size-'])]:size-5 px-4 py-2"
                )}
              >
                <social.icon />
              </TrackedLink>
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
        <p className="text-center text-primary-foreground/40 flex flex-wrap items-center justify-center gap-1">
          {t("made")} <Heart className="w-3.5 h-3.5 text-accent" /> {t("by")} · {new Date().getFullYear()}
          <span aria-hidden>·</span>
          {/* `LocalizedLink` y no `next/link`: la ruta está traducida
              (/privacidad en español) y el href se resuelve por locale. */}
          <LocalizedLink href="/privacy" className="hover:text-primary-foreground transition-colors underline-offset-4 hover:underline">
            {t("privacy")}
          </LocalizedLink>
        </p>
      </div>
    </footer>
  );
}
