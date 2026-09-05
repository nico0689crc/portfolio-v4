export type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * Id estable para un encabezado, derivado de su texto.
 *
 * Se deriva y no se genera al azar porque es la URL del ancla: si cambiara en
 * cada render, cualquier link a `#una-seccion` que alguien haya compartido
 * dejaría de funcionar en el próximo deploy.
 */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    // Saca los diacríticos pero deja la letra: "Diseño" → "diseno", no "diseo".
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Encabezados de nivel 2 y 3 del markdown, para la tabla de contenidos.
 *
 * Se leen del texto plano y no del árbol renderizado porque el índice se arma
 * en el servidor, antes de que exista ningún DOM. Ignora lo que esté dentro de
 * un bloque de código: un comentario `## algo` en un ejemplo no es una sección.
 */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  let insideFence = false;

  for (const line of markdown.split('\n')) {
    if (line.trimStart().startsWith('```')) {
      insideFence = !insideFence;
      continue;
    }

    if (insideFence) continue;

    const match = line.match(/^(#{2,3})\s+(.+?)\s*$/);

    if (!match) continue;

    // Saca el énfasis del markdown para que el índice no muestre asteriscos.
    const text = match[2].replace(/[*_`]/g, '');

    headings.push({ id: headingId(text), text, level: match[1].length as 2 | 3 });
  }

  return headings;
}
