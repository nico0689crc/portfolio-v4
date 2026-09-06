// Next Imports
import Link from 'next/link'

// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/admin/ui/alert'
import { Button } from '@/components/admin/ui/button'
import MetricsReport from '@/components/admin/views/metrics/MetricsReport'

// Lib Imports
import { getSeoReport, metricsConfig, PERIODS, PERIOD_LABELS, type PeriodDays } from '@/lib/metrics/report'

export const metadata = { title: 'Métricas de SEO' }

const DEFAULT_PERIOD: PeriodDays = 28

const AdminMetricsPage = async ({ searchParams }: { searchParams: Promise<{ dias?: string }> }) => {
  const { dias } = await searchParams

  const requested = Number(dias)
  const days: PeriodDays = PERIODS.includes(requested as PeriodDays) ? (requested as PeriodDays) : DEFAULT_PERIOD

  // Sin credenciales la página tiene que abrirse igual y decir qué falta: un
  // deploy sin configurar es un estado esperable, no una pantalla rota.
  if (!metricsConfig()) {
    return (
      <div className='flex flex-col gap-6'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Métricas de SEO</h1>
          <p className='text-muted-foreground text-sm'>Datos de Search Console y Analytics.</p>
        </div>

        <Alert>
          <AlertTitle>Falta configurar el acceso</AlertTitle>
          <AlertDescription>
            Definí <code>GOOGLE_SERVICE_ACCOUNT_JSON</code>, <code>GA4_PROPERTY_ID</code> y{' '}
            <code>SEARCH_CONSOLE_SITE_URL</code> en las variables de entorno. La cuenta de servicio sólo
            necesita permiso de lectura en ambas propiedades.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const report = await getSeoReport(days)

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Métricas de SEO</h1>
          <p className='text-muted-foreground text-sm'>
            {report.period.start} a {report.period.end}
            {report.previous ? ', comparado con el período anterior de igual largo.' : '.'}
          </p>
        </div>

        <div className='flex flex-wrap gap-1'>
          {PERIODS.map(period => (
            <Button
              key={period}
              size='sm'
              variant={period === days ? 'default' : 'outline'}
              render={<Link href={`/admin/metricas?dias=${period}`} />}
            >
              {PERIOD_LABELS[period]}
            </Button>
          ))}
        </div>
      </div>

      <MetricsReport report={report} />

      <p className='text-muted-foreground text-xs'>
        Los datos se refrescan cada seis horas. Search Console publica con dos o tres días de retraso y
        guarda 16 meses de historia; Analytics tarda unas 24 horas en consolidar.{' '}
        <Link href='/admin/seo' className='hover:text-foreground underline underline-offset-4'>
          Editar el SEO de cada página
        </Link>
        .
      </p>
    </div>
  )
}

export default AdminMetricsPage
