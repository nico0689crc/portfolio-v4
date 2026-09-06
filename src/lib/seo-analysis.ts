/**
 * Análisis de SEO y legibilidad de un artículo.
 *
 * Es lo que hace Yoast: no adivina un puntaje, contrasta el texto contra una
 * frase clave declarada y contra unos pocos umbrales que la industria dio por
 * buenos. Sin frase clave la mitad de los chequeos no tienen contra qué medir,
 * y por eso el primero es tenerla.
 *
 * Función pura y sin dependencias: corre en el editor mientras se escribe, así
 * que no puede pedirle nada al servidor ni tardar.
 *
 * Ninguna verificación bloquea el guardado. Son señales, no reglas: un artículo
 * corto sobre algo muy específico puede posicionar igual, y un checklist que
 * impide publicar termina ignorado o burlado.
 */

export type CheckStatus = 'good' | 'warning' | 'bad'

export type Check = {
  id: string
  status: CheckStatus
  message: string
  group: 'keyphrase' | 'content' | 'readability'
}

export type AnalysisInput = {
  keyphrase: string
  title: string
  seoTitle: string
  description: string
  slug: string
  body: string
}

/** Minúsculas sin diacríticos: "Diseño UX" y "diseno ux" son la misma frase. */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

/**
 * ¿El texto contiene la frase clave?
 *
 * Busca las palabras, no la cadena literal. «Desarrollador web en Corrientes»
 * contiene «desarrollador web corrientes» aunque no sea un substring: el
 * castellano mete preposiciones en el medio todo el tiempo, y exigir la cadena
 * exacta empuja a escribir titulares agramaticales para complacer al chequeo.
 *
 * Compara palabras completas para que «web» no matchee dentro de «webinar».
 */
const includesPhrase = (haystack: string, phrase: string) => {
  const text = normalize(haystack)
  const words = normalize(phrase).split(/[\s-]+/).filter(Boolean)

  if (words.length === 0) return false

  return words.every(word => new RegExp(`(^|[^a-z0-9])${word}([^a-z0-9]|$)`).test(text))
}

/** El markdown sin sintaxis, para contar palabras sobre el texto real. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const countWords = (text: string) => (text ? text.split(/\s+/).filter(Boolean).length : 0)

/** Los párrafos del cuerpo, ignorando encabezados y bloques de código. */
function paragraphs(markdown: string): string[] {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(block => block && !block.startsWith('#') && !block.startsWith('>') && !block.startsWith('|'))
}

const subheadings = (markdown: string) =>
  [...markdown.matchAll(/^#{2,3}\s+(.+)$/gm)].map(match => match[1])

const imageAlts = (markdown: string) => [...markdown.matchAll(/!\[([^\]]*)\]\(/g)].map(match => match[1])

const links = (markdown: string) => [...markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1])

/** Concordancia de número, para no escribir «1 enlaces internos». */
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

const check = (id: string, group: Check['group'], status: CheckStatus, message: string): Check => ({
  id,
  group,
  status,
  message
})

export function analyzePost(input: AnalysisInput): Check[] {
  const checks: Check[] = []
  const keyphrase = input.keyphrase.trim()
  const plain = toPlainText(input.body)
  const words = countWords(plain)
  const effectiveTitle = input.seoTitle || input.title

  // ---------------------------------------------------------------- frase clave

  if (!keyphrase) {
    checks.push(
      check('keyphrase', 'keyphrase', 'bad', 'Sin frase clave: no hay contra qué analizar el texto.')
    )
  } else {
    const keyphraseWords = countWords(keyphrase)

    checks.push(
      keyphraseWords > 6
        ? check('keyphrase', 'keyphrase', 'warning', 'La frase clave es muy larga; casi nadie busca así.')
        : check('keyphrase', 'keyphrase', 'good', `Frase clave: «${keyphrase}».`)
    )

    checks.push(
      includesPhrase(effectiveTitle, keyphrase)
        ? check('kp-title', 'keyphrase', 'good', 'La frase clave aparece en el título.')
        : check('kp-title', 'keyphrase', 'bad', 'La frase clave no aparece en el título.')
    )

    checks.push(
      includesPhrase(input.description, keyphrase)
        ? check('kp-description', 'keyphrase', 'good', 'La frase clave aparece en la descripción.')
        : check('kp-description', 'keyphrase', 'warning', 'La frase clave no aparece en la descripción.')
    )

    checks.push(
      includesPhrase(input.slug, keyphrase.replace(/\s+/g, '-'))
        ? check('kp-slug', 'keyphrase', 'good', 'La frase clave aparece en la URL.')
        : check('kp-slug', 'keyphrase', 'warning', 'La frase clave no aparece en la URL.')
    )

    const firstParagraph = paragraphs(input.body)[0] ?? ''

    checks.push(
      includesPhrase(firstParagraph, keyphrase)
        ? check('kp-intro', 'keyphrase', 'good', 'La frase clave aparece en el primer párrafo.')
        : check(
            'kp-intro',
            'keyphrase',
            'warning',
            'La frase clave no aparece en el primer párrafo, que es donde se confirma de qué trata la nota.'
          )
    )

    const heads = subheadings(input.body)

    checks.push(
      heads.some(heading => includesPhrase(heading, keyphrase))
        ? check('kp-subheading', 'keyphrase', 'good', 'La frase clave aparece en un subtítulo.')
        : check('kp-subheading', 'keyphrase', 'warning', 'Ningún subtítulo contiene la frase clave.')
    )

    // Apariciones de la frase completa sobre el total de palabras, que es la
    // definición estándar. Multiplicarla por el largo de la frase —el error
    // fácil— da 8% donde hay 2,7% y sugiere recortar un texto que no repite
    // nada.
    const occurrences = normalize(plain).split(normalize(keyphrase)).length - 1
    const density = words > 0 ? (occurrences * 100) / words : 0

    if (words > 0) {
      checks.push(
        density < 0.5
          ? check('kp-density', 'keyphrase', 'warning', `Densidad ${density.toFixed(1)}%: aparece poco.`)
          : density > 2.5
            ? check('kp-density', 'keyphrase', 'bad', `Densidad ${density.toFixed(1)}%: suena forzado.`)
            : check('kp-density', 'keyphrase', 'good', `Densidad ${density.toFixed(1)}%, en rango.`)
      )
    }

    const alts = imageAlts(input.body)

    if (alts.length > 0) {
      checks.push(
        alts.some(alt => includesPhrase(alt, keyphrase))
          ? check('kp-alt', 'keyphrase', 'good', 'Alguna imagen la menciona en su texto alternativo.')
          : check('kp-alt', 'keyphrase', 'warning', 'Ninguna imagen la menciona en su texto alternativo.')
      )
    }
  }

  // -------------------------------------------------------------------- contenido

  checks.push(
    words >= 600
      ? check('length', 'content', 'good', `${plural(words, 'palabra', 'palabras')}.`)
      : words >= 300
        ? check('length', 'content', 'warning', `${plural(words, 'palabra', 'palabras')}: corto para competir por una búsqueda.`)
        : check('length', 'content', 'bad', `${plural(words, 'palabra', 'palabras')}: demasiado corto.`)
  )

  const titleLength = effectiveTitle.length

  checks.push(
    titleLength === 0
      ? check('title-length', 'content', 'bad', 'Falta el título.')
      : titleLength > 60
        ? check('title-length', 'content', 'warning', `Título de ${titleLength} caracteres: Google lo va a cortar.`)
        : titleLength < 30
          ? check('title-length', 'content', 'warning', `Título de ${titleLength} caracteres: sobra lugar.`)
          : check('title-length', 'content', 'good', `Título de ${titleLength} caracteres.`)
  )

  const descriptionLength = input.description.length

  checks.push(
    descriptionLength === 0
      ? check('description-length', 'content', 'bad', 'Falta la descripción.')
      : descriptionLength > 155
        ? check('description-length', 'content', 'warning', `Descripción de ${descriptionLength} caracteres: se va a cortar.`)
        : descriptionLength < 120
          ? check('description-length', 'content', 'warning', `Descripción de ${descriptionLength} caracteres: sobra lugar.`)
          : check('description-length', 'content', 'good', `Descripción de ${descriptionLength} caracteres.`)
  )

  const heads = subheadings(input.body)

  checks.push(
    heads.length === 0 && words > 300
      ? check('subheadings', 'content', 'bad', 'Sin subtítulos: un muro de texto se abandona.')
      : heads.length === 0
        ? check('subheadings', 'content', 'warning', 'Sin subtítulos.')
        : check('subheadings', 'content', 'good', `${plural(heads.length, 'subtítulo', 'subtítulos')}.`)
  )

  const alts = imageAlts(input.body)
  const missingAlt = alts.filter(alt => !alt.trim()).length

  if (alts.length > 0) {
    checks.push(
      missingAlt === 0
        ? check('alts', 'content', 'good', 'Todas las imágenes tienen texto alternativo.')
        : check(
            'alts',
            'content',
            'bad',
            `${missingAlt} ${missingAlt === 1 ? 'imagen' : 'imágenes'} sin texto alternativo.`
          )
    )
  } else if (words > 300) {
    checks.push(check('alts', 'content', 'warning', 'Sin imágenes.'))
  }

  const allLinks = links(input.body)
  const outbound = allLinks.filter(href => /^https?:\/\//.test(href)).length
  const internal = allLinks.length - outbound

  checks.push(
    internal > 0
      ? check('internal-links', 'content', 'good', `${plural(internal, 'enlace interno', 'enlaces internos')}.`)
      : check('internal-links', 'content', 'warning', 'Sin enlaces internos: la nota es un callejón.')
  )

  checks.push(
    outbound > 0
      ? check('outbound-links', 'content', 'good', `${plural(outbound, 'enlace externo', 'enlaces externos')}.`)
      : check('outbound-links', 'content', 'warning', 'Sin enlaces externos que respalden lo que decís.')
  )

  // ----------------------------------------------------------------- legibilidad

  const blocks = paragraphs(input.body)
  const longParagraphs = blocks.filter(block => countWords(block) > 150).length

  if (blocks.length > 0) {
    checks.push(
      longParagraphs === 0
        ? check('paragraphs', 'readability', 'good', 'Ningún párrafo excesivamente largo.')
        : check(
            'paragraphs',
            'readability',
            'warning',
            `${longParagraphs} ${longParagraphs === 1 ? 'párrafo pasa' : 'párrafos pasan'} las 150 palabras.`
          )
    )
  }

  const sentences = plain.split(/[.!?]+\s/).filter(Boolean)
  const longSentences = sentences.filter(sentence => countWords(sentence) > 25).length
  const longShare = sentences.length > 0 ? (longSentences * 100) / sentences.length : 0

  if (sentences.length > 3) {
    checks.push(
      longShare <= 25
        ? check('sentences', 'readability', 'good', 'Las oraciones tienen buen largo.')
        : check(
            'sentences',
            'readability',
            'warning',
            `${Math.round(longShare)}% de las oraciones pasa las 25 palabras.`
          )
    )
  }

  return checks
}

/** Resumen para el encabezado del panel. */
export function summarize(checks: Check[]) {
  return {
    good: checks.filter(c => c.status === 'good').length,
    warning: checks.filter(c => c.status === 'warning').length,
    bad: checks.filter(c => c.status === 'bad').length
  }
}
