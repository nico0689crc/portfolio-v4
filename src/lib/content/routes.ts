/**
 * Rutas que sirven documentos generados y no páginas.
 *
 * Se listan aparte porque son lo único que `revalidateTag` no alcanza:
 * verificado en next@16.1.6 que no purga las entradas de `unstable_cache`,
 * mientras que `revalidatePath` sí fuerza el re-render. Cualquier invalidación
 * que quiera refrescar un documento tiene que recorrer esta lista.
 */
export const GENERATED_DOCUMENT_ROUTES = [
  '/CV_Nicolas_Fernandez_FullStack_UXUI_EN.pdf',
  '/CV_Nicolas_Fernandez_FullStack_UXUI_ES.pdf',
  '/CV_Nicolas_Fernandez_FullStack_UXUI_EN_Extended.pdf',
  '/CV_Nicolas_Fernandez_FullStack_UXUI_ES_Extended.pdf',
  '/resume.json',
  '/resume.es.json',
  '/rss.xml',
  '/rss.es.xml',
  '/llms.txt'
] as const;
