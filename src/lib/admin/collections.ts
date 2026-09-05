// Lib Imports
import { TAGS } from '@/lib/content/tags'
import type { Database } from '@/types/database'

/** Sólo tablas que existen: un typo en una definición no compila. */
export type TableName = keyof Database['public']['Tables']

/**
 * Definiciones de las colecciones editables del panel.
 *
 * Siete pantallas tienen exactamente la misma forma —una fila base ordenada más
 * una fila de traducción por idioma— y la única diferencia entre ellas son los
 * nombres de las columnas. Describirlas como datos evita siete copias del mismo
 * CRUD, que es donde se cuelan las diferencias que nadie quiso: una que valida
 * el slug y otra que no, una que invalida el cache y otra que se olvida.
 *
 * Lo que NO entra acá son las pantallas de forma propia (ajustes, redirecciones,
 * mensajes, textos de UI). Forzarlas en este molde costaria mas que escribirlas.
 */

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'url' | 'boolean' | 'list'

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  help?: string
  required?: boolean
}

export type CollectionDef = {
  /** Segmento de ruta bajo /admin. */
  slug: string
  title: string
  description: string
  table: TableName
  translationTable: TableName
  foreignKey: string
  /** Columnas de la fila base, iguales en todos los idiomas. */
  base: FieldDef[]
  /** Columnas que existen una vez por idioma. */
  translated: FieldDef[]
  /** Campo traducido que titula cada tarjeta en la lista. */
  labelField: string
  /** Tags a invalidar despues de guardar. */
  tags: string[]
}

export const COLLECTIONS: Record<string, CollectionDef> = {
  experiencia: {
    slug: 'curriculum/experiencia',
    title: 'Experiencia',
    description: 'Trayectoria laboral que alimenta el CV, el JSON Resume y el structured data.',
    table: 'experiences',
    translationTable: 'experience_translations',
    foreignKey: 'experience_id',
    base: [
      { name: 'organization', label: 'Organización', type: 'text', required: true },
      { name: 'employment_type', label: 'Tipo de empleo', type: 'text' },
      { name: 'remote', label: 'Remoto', type: 'boolean' },
      { name: 'techs', label: 'Tecnologías', type: 'list', help: 'Separadas por coma.' },
      { name: 'start_date', label: 'Desde', type: 'date', required: true },
      { name: 'end_date', label: 'Hasta', type: 'date', help: 'Vacío si sigue vigente.' }
    ],
    translated: [
      { name: 'role', label: 'Rol', type: 'text', required: true },
      { name: 'location', label: 'Ubicación', type: 'text' },
      { name: 'date_label', label: 'Etiqueta de fecha', type: 'text', help: 'Lo que se muestra; las fechas reales son las de arriba.' },
      { name: 'description', label: 'Descripción', type: 'textarea' }
    ],
    labelField: 'role',
    tags: [TAGS.experiences, TAGS.all]
  },

  educacion: {
    slug: 'curriculum/educacion',
    title: 'Educación',
    description: 'Títulos y cursadas.',
    table: 'education',
    translationTable: 'education_translations',
    foreignKey: 'education_id',
    base: [
      { name: 'institution', label: 'Institución', type: 'text', required: true },
      { name: 'url', label: 'URL', type: 'url' },
      { name: 'start_date', label: 'Desde', type: 'date' },
      { name: 'end_date', label: 'Hasta', type: 'date' }
    ],
    translated: [
      { name: 'degree', label: 'Título', type: 'text', required: true },
      { name: 'date_label', label: 'Etiqueta de fecha', type: 'text' },
      { name: 'location', label: 'Ubicación', type: 'text' }
    ],
    labelField: 'degree',
    tags: [TAGS.education, TAGS.all]
  },

  certificaciones: {
    slug: 'curriculum/certificaciones',
    title: 'Certificaciones',
    description: 'Credenciales que salen en el CV y en el JSON-LD como hasCredential.',
    table: 'certifications',
    translationTable: 'certification_translations',
    foreignKey: 'certification_id',
    base: [
      { name: 'issuer', label: 'Emisor', type: 'text', required: true },
      { name: 'year', label: 'Año', type: 'number' },
      { name: 'url', label: 'URL', type: 'url' }
    ],
    translated: [{ name: 'name', label: 'Nombre', type: 'text', required: true }],
    labelField: 'name',
    tags: [TAGS.certifications, TAGS.all]
  },

  destacados: {
    slug: 'curriculum/destacados',
    title: 'Destacados',
    description: 'Los números grandes del CV: un valor y su etiqueta.',
    table: 'resume_highlights',
    translationTable: 'resume_highlight_translations',
    foreignKey: 'highlight_id',
    base: [],
    translated: [
      { name: 'value', label: 'Valor', type: 'text', required: true, help: 'La cifra grande: "+8", "15".' },
      { name: 'label', label: 'Etiqueta', type: 'text', required: true }
    ],
    labelField: 'label',
    tags: [TAGS.highlights, TAGS.all]
  },

  faqs: {
    slug: 'faqs',
    title: 'FAQs',
    description: 'Preguntas frecuentes. Alimentan el bloque público y el FAQPage del structured data.',
    table: 'faqs',
    translationTable: 'faq_translations',
    foreignKey: 'faq_id',
    base: [],
    translated: [
      { name: 'question', label: 'Pregunta', type: 'text', required: true },
      { name: 'answer', label: 'Respuesta', type: 'textarea', required: true }
    ],
    labelField: 'question',
    tags: [TAGS.faqs, TAGS.all]
  }
}

/** Todas las colecciones indexadas por su ruta, para resolver el segmento. */
export const COLLECTION_BY_SLUG: Record<string, CollectionDef> = Object.fromEntries(
  Object.values(COLLECTIONS).map(def => [def.slug, def])
)
