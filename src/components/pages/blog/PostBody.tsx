import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * El cuerpo se guarda en markdown, así que se renderiza a componentes de React
 * y no a una cadena de HTML inyectada.
 *
 * La diferencia importa aunque el autor sea de confianza: sin
 * `dangerouslySetInnerHTML` no hay ninguna ruta por la que el contenido de la
 * base termine ejecutándose, ni siquiera si algún día lo escribe otra persona
 * desde el panel.
 *
 * Los estilos van por elemento porque el proyecto no tiene el plugin de
 * tipografía de Tailwind, y agregarlo pisaría estilos del sitio público que ya
 * están afinados a mano.
 */
const PostBody = ({ body }: { body: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h2: ({ children }) => (
        <h2 className="font-display text-2xl font-bold text-foreground mt-10 mb-3">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="font-display text-xl font-bold text-foreground mt-8 mb-2">{children}</h3>
      ),
      p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>,
      ul: ({ children }) => (
        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-1">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal pl-6 mb-4 text-muted-foreground space-y-1">{children}</ol>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          target={href?.startsWith("http") ? "_blank" : undefined}
          rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-accent underline underline-offset-2 hover:opacity-80 transition"
        >
          {children}
        </a>
      ),
      code: ({ children }) => (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">{children}</code>
      ),
      pre: ({ children }) => (
        // El bloque scrollea solo para que una línea larga no ensanche la página.
        <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm">{children}</pre>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-accent pl-4 italic text-muted-foreground mb-4">
          {children}
        </blockquote>
      ),
      table: ({ children }) => (
        <div className="mb-4 overflow-x-auto">
          <table className="w-full text-sm text-muted-foreground">{children}</table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border-b border-border pb-2 text-left font-semibold text-foreground">{children}</th>
      ),
      td: ({ children }) => <td className="border-b border-border/50 py-2">{children}</td>,
    }}
  >
    {body}
  </ReactMarkdown>
);

export default PostBody;
