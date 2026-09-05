/**
 * Los idiomas del sitio, sin ninguna dependencia.
 *
 * Existe aparte de `routing.ts` para romper un ciclo: la capa de contenido
 * necesita saber cuál es el idioma por defecto, y si lo saca de `routing`
 * termina en un import circular con next-intl —`request.ts` carga los mensajes,
 * los mensajes cargan `internal.ts`, `internal.ts` carga `routing`, y next-intl
 * vuelve a entrar a `request.ts` mientras `routing` todavía se está
 * inicializando. El síntoma es «Cannot access 'routing' before initialization»
 * en cada página.
 *
 * `routing.ts` los consume desde acá, así que siguen definidos una sola vez.
 */
export const LOCALES = ['es', 'en'] as const;

export const DEFAULT_LOCALE = 'en';

export type Locale = (typeof LOCALES)[number];
