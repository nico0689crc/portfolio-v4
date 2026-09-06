/**
 * Slug a partir de un texto libre.
 *
 * Se usa en el cliente para previsualizar lo que se va a generar y en el
 * servidor para generarlo de verdad. Vive en un módulo compartido porque dos
 * implementaciones que tienen que coincidir siempre terminan no coincidiendo:
 * el editor vería una cosa y se guardaría otra.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    // Saca los diacríticos y deja la letra: "diseño" → "diseno".
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    // Un slug de 80 caracteres ya no aporta nada y complica cualquier listado.
    .slice(0, 80)
    .replace(/-$/, '');
}
