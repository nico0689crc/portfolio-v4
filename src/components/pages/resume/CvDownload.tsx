"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import type { CvLocation } from "@/lib/analytics";

/**
 * Descarga del CV con selector de versión.
 *
 * El botón principal baja la resumida, que es la que quiere casi todo el mundo.
 * La extendida vive en el desplegable en vez de en un tercer botón: son la misma
 * cosa con distinto nivel de detalle, y presentarlas como opciones separadas
 * obliga a decidir algo que a la mayoría no le importa.
 */
const CvDownload = ({
  label,
  locale,
  shortHref,
  extendedHref,
  labels,
  variant = "primary"
}: {
  label: string;
  locale: string;
  shortHref: string;
  extendedHref: string | null;
  labels: { short: string; extended: string; pick: string };
  variant?: "primary" | "outline";
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Cerrar al hacer clic afuera o con Escape: sin esto el menú queda abierto
    // tapando el contenido y hay que volver a apretar el mismo botón.
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const base =
    variant === "primary"
      ? "bg-accent text-accent-foreground hover:opacity-90"
      : "border border-border text-foreground hover:border-accent hover:text-accent";

  const event = (source: CvLocation) =>
    ({ name: "cv_download", params: { file_language: locale, source } }) as const;

  // Sin versión extendida el desplegable no aporta nada, así que no aparece.
  if (!extendedHref) {
    return (
      <TrackedLink
        href={shortHref}
        target="_blank"
        rel="noopener noreferrer"
        event={event("resume")}
        className={`inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-lg transition-all duration-200 ${base}`}
      >
        <Download className="w-5 h-5" />
        {label}
      </TrackedLink>
    );
  }

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <TrackedLink
        href={shortHref}
        target="_blank"
        rel="noopener noreferrer"
        event={event("resume")}
        className={`inline-flex items-center justify-center gap-2 pl-8 pr-6 py-4 font-semibold rounded-l-lg transition-all duration-200 ${base}`}
      >
        <Download className="w-5 h-5" />
        {label}
      </TrackedLink>

      <button
        type="button"
        aria-label={labels.pick}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center px-3 rounded-r-lg border-l border-black/10 transition-all duration-200 ${base}`}
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 right-0 mt-2 z-20 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
        >
          <TrackedLink
            href={shortHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            event={event("resume")}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm text-left text-foreground hover:bg-secondary transition-colors"
          >
            {labels.short}
          </TrackedLink>
          <TrackedLink
            href={extendedHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            event={event("resume_extended")}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm text-left text-foreground hover:bg-secondary border-t border-border transition-colors"
          >
            {labels.extended}
          </TrackedLink>
        </div>
      )}
    </div>
  );
};

export default CvDownload;
