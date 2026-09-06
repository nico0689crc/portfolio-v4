import { getRequestConfig } from 'next-intl/server';
import { getMessageTree } from '@/lib/content/messages';
import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

/**
 * El árbol de mensajes se arma desde la base, no desde `messages/<locale>.json`.
 *
 * Este es el punto donde el sitio pasa a ser editable de verdad: `t()` y
 * `t.raw()` siguen funcionando igual en cada componente, pero el texto sale de
 * `ui_messages` y de las tablas de contenido, así que lo que se guarda en el
 * backoffice es lo que se sirve.
 *
 * Los JSON quedan en el repo como referencia del seed; ya no los lee nadie en
 * runtime.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // Se valida contra las constantes y no contra `routing`, que es justamente
  // el import que cerraba el ciclo.
  const locale = requested && LOCALES.includes(requested as Locale) ? requested : DEFAULT_LOCALE;

  return {
    locale,
    messages: await getMessageTree(locale)
  };
});
