/**
 * Renders a JSON-LD document into a `<script type="application/ld+json">`.
 * `<` is escaped so a stray angle bracket in the data can't close the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c')
      }}
    />
  );
}
