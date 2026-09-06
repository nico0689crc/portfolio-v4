'use client'

// React Imports
import { useMemo } from 'react'

// Third-party Imports
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

// Lib Imports
import { analyzePost, summarize, type AnalysisInput, type Check } from '@/lib/seo-analysis'

const GROUPS: { key: Check['group']; label: string }[] = [
  { key: 'keyphrase', label: 'Frase clave' },
  { key: 'content', label: 'Contenido' },
  { key: 'readability', label: 'Legibilidad' }
]

const ICONS = {
  good: CheckCircle2,
  warning: AlertTriangle,
  bad: XCircle
} as const

const COLORS = {
  good: 'text-emerald-600 dark:text-emerald-500',
  warning: 'text-amber-600 dark:text-amber-500',
  bad: 'text-destructive'
} as const

/**
 * El resultado del análisis, agrupado.
 *
 * Ordena por severidad dentro de cada grupo: lo que falta arriba, lo que ya
 * está resuelto al final. Una lista en orden fijo obliga a leerla entera cada
 * vez para encontrar lo único que cambió.
 */
const SeoAnalysis = (input: AnalysisInput) => {
  const checks = useMemo(() => analyzePost(input), [input])
  const totals = summarize(checks)

  const order = { bad: 0, warning: 1, good: 2 } as const

  return (
    <div className='border-border flex flex-col gap-4 rounded-lg border p-4'>
      <div className='flex flex-wrap items-center gap-3 text-sm'>
        <span className='font-medium'>Análisis</span>
        <span className={COLORS.bad}>{totals.bad} a corregir</span>
        <span className={COLORS.warning}>{totals.warning} a revisar</span>
        <span className={COLORS.good}>{totals.good} en orden</span>
      </div>

      {GROUPS.map(group => {
        const items = checks
          .filter(item => item.group === group.key)
          .sort((a, b) => order[a.status] - order[b.status])

        if (items.length === 0) return null

        return (
          <div key={group.key} className='flex flex-col gap-1.5'>
            <p className='text-muted-foreground text-xs font-semibold tracking-widest uppercase'>
              {group.label}
            </p>
            <ul className='flex flex-col gap-1'>
              {items.map(item => {
                const Icon = ICONS[item.status]

                return (
                  <li key={item.id} className='flex items-start gap-2 text-sm'>
                    <Icon className={`mt-0.5 size-4 shrink-0 ${COLORS[item.status]}`} aria-hidden />
                    <span className='text-muted-foreground'>{item.message}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export default SeoAnalysis
