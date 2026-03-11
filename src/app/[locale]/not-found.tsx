import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");

  return (
    <div className="min-h-[70vh] mt-20 flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping opacity-60"></div>
        <div className="relative w-24 h-24 bg-card border-4 border-background text-accent rounded-full flex items-center justify-center shadow-lg mx-auto">
          <Compass className="w-12 h-12" strokeWidth={1.5} />
        </div>
      </div>

      <p className="text-sm font-semibold text-accent tracking-widest uppercase mb-3">
        {t("errorCode")}
      </p>

      <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4 tracking-tight">
        {t("title")}
      </h1>

      <p className="text-muted-foreground text-lg max-w-[500px] mx-auto mb-10 leading-relaxed">
        {t("description")}
      </p>
      <Link
        href="/"
      >
        <Button>
          {t("button")}
        </Button>
      </Link>
    </div>
  );
}
