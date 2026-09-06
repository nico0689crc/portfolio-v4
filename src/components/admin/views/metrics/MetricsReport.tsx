// Component Imports
import { Alert, AlertDescription, AlertTitle } from '@/components/admin/ui/alert'
import { Badge } from '@/components/admin/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/admin/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/ui/table'

// Lib Imports
import type { SeoReport } from '@/lib/metrics/report'

import { delta, formatNumber, formatPercent, formatPosition, shortenPath, type Delta } from './format'

const DeltaBadge = ({ value }: { value: Delta }) => {
  if (!value) return null

  return (
    <Badge variant={value.better ? 'secondary' : 'destructive'} className='font-normal tabular-nums'>
      {value.label}
    </Badge>
  )
}

const Stat = ({ label, value, change }: { label: string; value: string; change?: Delta }) => (
  <Card>
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      <CardTitle className='text-3xl tabular-nums'>{value}</CardTitle>
      {change ? (
        <div className='mt-1'>
          <DeltaBadge value={change} />
        </div>
      ) : null}
    </CardHeader>
  </Card>
)

const Panel = ({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children: React.ReactNode
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className='text-muted-foreground py-6 text-center text-sm'>{children}</p>
)

const MetricsReport = ({ report }: { report: SeoReport }) => {
  const { search, analytics, errors, previous } = report

  return (
    <div className='flex flex-col gap-6'>
      {errors.search ? (
        <Alert variant='destructive'>
          <AlertTitle>Search Console no respondió</AlertTitle>
          <AlertDescription>{errors.search}</AlertDescription>
        </Alert>
      ) : null}

      {errors.analytics ? (
        <Alert variant='destructive'>
          <AlertTitle>Analytics no respondió</AlertTitle>
          <AlertDescription>{errors.analytics}</AlertDescription>
        </Alert>
      ) : null}

      {/* --- Búsqueda ------------------------------------------------------ */}

      <section className='flex flex-col gap-4'>
        <div>
          <h2 className='text-lg font-semibold'>Búsqueda</h2>
          <p className='text-muted-foreground text-sm'>
            Cuánta gente ve el sitio en Google y en qué posición aparece.
            {previous ? '' : ' El período anterior excede los 16 meses que guarda Google, así que no hay comparación.'}
          </p>
        </div>

        {search?.totals && search.totals.impressions > 0 ? (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Stat
              label='Impresiones'
              value={formatNumber(search.totals.impressions)}
              change={delta(search.totals.impressions, previous ? search.previous?.impressions : null)}
            />
            <Stat
              label='Clics'
              value={formatNumber(search.totals.clicks)}
              change={delta(search.totals.clicks, previous ? search.previous?.clicks : null)}
            />
            <Stat
              label='CTR'
              value={formatPercent(search.totals.ctr)}
              change={delta(search.totals.ctr, previous ? search.previous?.ctr : null)}
            />
            <Stat
              label='Posición media'
              value={formatPosition(search.totals.position)}
              change={delta(search.totals.position, previous ? search.previous?.position : null, {
                lowerIsBetter: true
              })}
            />
          </div>
        ) : (
          <Card>
            <CardContent className='py-6'>
              <Empty>
                Sin impresiones en el período. Search Console publica con dos o tres días de retraso.
              </Empty>
            </CardContent>
          </Card>
        )}

        <div className='grid gap-4 lg:grid-cols-2'>
          <Panel
            title='Consultas'
            description='Lo que la gente escribió en Google. Que aparezcan búsquedas de perfil y no sólo tu nombre es la señal de que el contenido funciona.'
          >
            {search?.queries.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consulta</TableHead>
                    <TableHead className='text-right'>Impr.</TableHead>
                    <TableHead className='text-right'>Clics</TableHead>
                    <TableHead className='text-right'>CTR</TableHead>
                    <TableHead className='text-right'>Pos.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {search.queries.map(row => (
                    <TableRow key={row.key}>
                      <TableCell className='font-medium'>{row.key}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.impressions)}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.clicks)}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatPercent(row.ctr)}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatPosition(row.position)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>Todavía no hay consultas registradas.</Empty>
            )}
          </Panel>

          <Panel
            title='Páginas en búsqueda'
            description='Buena posición con CTR bajo significa que el título o la descripción no convencen: eso se edita en SEO por página.'
          >
            {search?.pages.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Página</TableHead>
                    <TableHead className='text-right'>Impr.</TableHead>
                    <TableHead className='text-right'>Clics</TableHead>
                    <TableHead className='text-right'>CTR</TableHead>
                    <TableHead className='text-right'>Pos.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {search.pages.map(row => (
                    <TableRow key={row.key}>
                      <TableCell className='font-medium'>
                        <a
                          href={row.key}
                          target='_blank'
                          rel='noreferrer'
                          className='hover:text-primary underline-offset-4 hover:underline'
                        >
                          {shortenPath(row.key)}
                        </a>
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.impressions)}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.clicks)}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatPercent(row.ctr)}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatPosition(row.position)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>Todavía no hay páginas con impresiones.</Empty>
            )}
          </Panel>
        </div>
      </section>

      {/* --- Audiencia ----------------------------------------------------- */}

      <section className='flex flex-col gap-4'>
        <div>
          <h2 className='text-lg font-semibold'>Audiencia</h2>
          <p className='text-muted-foreground text-sm'>
            Quién entra y de dónde. El tráfico de Europa y Estados Unidos es el que mide si el enfoque
            bilingüe está sirviendo.
          </p>
        </div>

        {analytics?.audience ? (
          <div className='grid gap-4 sm:grid-cols-3'>
            <Stat
              label='Usuarios'
              value={formatNumber(analytics.audience[0])}
              change={delta(analytics.audience[0], previous ? analytics.previous?.[0] : null)}
            />
            <Stat
              label='Sesiones'
              value={formatNumber(analytics.audience[1])}
              change={delta(analytics.audience[1], previous ? analytics.previous?.[1] : null)}
            />
            <Stat
              label='Vistas de página'
              value={formatNumber(analytics.audience[2])}
              change={delta(analytics.audience[2], previous ? analytics.previous?.[2] : null)}
            />
          </div>
        ) : (
          <Card>
            <CardContent className='py-6'>
              <Empty>Sin visitas registradas en el período.</Empty>
            </CardContent>
          </Card>
        )}

        <div className='grid gap-4 lg:grid-cols-2'>
          <Panel title='Países' description='Según Analytics, por usuarios.'>
            {analytics?.countries.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>País</TableHead>
                    <TableHead className='text-right'>Usuarios</TableHead>
                    <TableHead className='text-right'>Sesiones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.countries.map(row => (
                    <TableRow key={row.keys[0]}>
                      <TableCell className='font-medium'>{row.keys[0]}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.values[0])}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.values[1])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>Sin datos de países.</Empty>
            )}
          </Panel>

          <Panel title='Páginas más vistas' description='Incluye visitas directas, no sólo las que llegan por Google.'>
            {analytics?.pages.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ruta</TableHead>
                    <TableHead className='text-right'>Vistas</TableHead>
                    <TableHead className='text-right'>Usuarios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.pages.map(row => (
                    <TableRow key={row.keys[0]}>
                      <TableCell className='font-medium'>{shortenPath(row.keys[0])}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.values[0])}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.values[1])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>Sin páginas registradas.</Empty>
            )}
          </Panel>
        </div>
      </section>

      {/* --- Conversiones -------------------------------------------------- */}

      <section className='flex flex-col gap-4'>
        <div>
          <h2 className='text-lg font-semibold'>Conversiones</h2>
          <p className='text-muted-foreground text-sm'>
            Descargas del CV y envíos del formulario. Es lo único que distingue una visita de un contacto.
          </p>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <Panel title='Descargas del CV' description='Por sección de origen e idioma del archivo.'>
            {analytics?.cvBySource === null ? (
              <Empty>
                Falta registrar <code>source</code> como dimensión personalizada en Analytics.
              </Empty>
            ) : analytics?.cvBySource?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origen</TableHead>
                    <TableHead>Idioma</TableHead>
                    <TableHead className='text-right'>Descargas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.cvBySource.map(row => (
                    <TableRow key={row.keys.join('·')}>
                      <TableCell className='font-medium'>{row.keys[0] || '(sin valor)'}</TableCell>
                      <TableCell>{row.keys[1] || '(sin valor)'}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.values[0])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>Todavía nadie descargó el CV en este período.</Empty>
            )}
          </Panel>

          <Panel title='Eventos' description='Todo lo que el sitio envía a Analytics.'>
            {analytics?.events.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead className='text-right'>Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.events.map(row => (
                    <TableRow key={row.keys[0]}>
                      <TableCell className='font-medium'>{row.keys[0]}</TableCell>
                      <TableCell className='text-right tabular-nums'>{formatNumber(row.values[0])}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>Sin eventos registrados.</Empty>
            )}
          </Panel>
        </div>
      </section>
    </div>
  )
}

export default MetricsReport
