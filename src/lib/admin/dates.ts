/**
 * Las fechas que muestra el panel, siempre en hora argentina.
 *
 * `toLocaleString` sin `timeZone` usa la zona del proceso, y en Vercel eso es
 * UTC: el turno de las 11 se veía como las 14 en producción y como las 11 en
 * local, que es por lo que tardó en aparecer. En un componente de cliente el
 * problema es el gemelo —toma la zona del navegador— y además hace que el HTML
 * que arma el server y el que arma el cliente no coincidan.
 *
 * Todo lo que el panel edita —turnos de la agenda, fechas de publicación— se
 * razona en esta zona, así que también se muestra en esta zona, sin importar
 * dónde corra el proceso ni desde dónde se mire.
 */
export const PANEL_TIMEZONE = 'America/Argentina/Buenos_Aires';

/** El panel es monolingüe, así que el idioma tampoco depende del navegador. */
const PANEL_LOCALE = 'es-AR';

/**
 * Formatea una fecha en la zona del panel.
 *
 * Existe para que no se pueda olvidar `timeZone`: cada llamada suelta a
 * `toLocaleString` es una que va a mostrar UTC en producción y nadie lo va a
 * notar hasta que alguien lea la hora y no le cierre.
 *
 * Si `options` no pide hora ni minutos, la salida es sólo la fecha.
 */
export function formatPanelDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(value).toLocaleString(PANEL_LOCALE, { ...options, timeZone: PANEL_TIMEZONE });
}
