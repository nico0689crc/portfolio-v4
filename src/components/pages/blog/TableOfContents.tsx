import type { Heading } from "./headings";

/**
 * Índice del artículo.
 *
 * Es un `<nav>` con una lista de enlaces internos reales, no un widget: así lo
 * puede recorrer un lector de pantalla y Google puede usarlo para ofrecer jump
 * links a una sección desde la SERP.
 *
 * Con menos de tres secciones no aparece — un índice de dos ítems ocupa más de
 * lo que ahorra.
 */
const TableOfContents = ({ headings, label }: { headings: Heading[]; label: string }) => {
  if (headings.length < 3) return null;

  return (
    <nav aria-label={label} className="mb-10 rounded-xl border border-border bg-muted/30 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">{label}</h2>
      <ol className="space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "ml-4" : undefined}>
            <a
              href={`#${heading.id}`}
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default TableOfContents;
