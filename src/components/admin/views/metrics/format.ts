// Formato compartido por las tablas del informe.

const number = new Intl.NumberFormat('es-AR')

export const formatNumber = (value: number) => number.format(value)

export const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

export const formatPosition = (value: number) => value.toFixed(1)

export type Delta = { label: string; better: boolean } | null

/**
 * Variación contra el período anterior.
 *
 * `lowerIsBetter` existe por la posición media: bajar de 8 a 3 es una mejora,
 * y pintarla de rojo por ser un número menor invertiría la lectura.
 */
export const delta = (
  current: number,
  before: number | null | undefined,
  { lowerIsBetter = false } = {}
): Delta => {
  if (before == null || before === 0) return null

  const change = ((current - before) / before) * 100

  if (Math.abs(change) < 0.5) return { label: 'sin cambio', better: true }

  return {
    label: `${change > 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(0)}%`,
    better: lowerIsBetter ? change < 0 : change > 0
  }
}

/** Recorta rutas largas por el medio: el final de la URL es lo que identifica. */
export const shortenPath = (value: string, max = 48) => {
  const path = value.replace(/^https?:\/\/[^/]+/, '') || '/'

  if (path.length <= max) return path

  return `${path.slice(0, max - 14)}…${path.slice(-13)}`
}
