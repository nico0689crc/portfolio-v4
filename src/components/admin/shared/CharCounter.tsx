'use client'

/**
 * Cuenta caracteres contra un máximo orientativo.
 *
 * Pasarse no es un error —Google recorta y sigue funcionando— así que avisa en
 * ámbar y nunca en rojo: el rojo de este panel significa "esto no se va a
 * guardar", y gastarlo en una advertencia le quita valor donde hace falta.
 */
const CharCounter = ({ value, limit }: { value: string; limit: number }) => {
  const over = value.length > limit

  return (
    <span className={over ? 'text-amber-600 dark:text-amber-500' : 'text-muted-foreground'}>
      {value.length} / {limit}
      {over && ' — se va a recortar'}
    </span>
  )
}

export default CharCounter
