// Component Imports
import CollectionEditor from './CollectionEditor'

// Lib Imports
import { loadCollection } from '@/lib/admin/collection-data'
import type { CollectionDef } from '@/lib/admin/collections'

/**
 * Cabecera y carga de datos, compartidas por todas las colecciones.
 *
 * Al editor sólo se le pasa lo que necesita para pintar el formulario, no la
 * definición entera: los tags de cache y los nombres de tabla se quedan del
 * lado del servidor, donde son lo único que decide qué se escribe.
 */
const CollectionScreen = async ({ def }: { def: CollectionDef }) => {
  const rows = await loadCollection(def)

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>{def.title}</h1>
        <p className='text-muted-foreground text-sm'>{def.description}</p>
      </div>

      <CollectionEditor
        def={{
          slug: def.slug,
          base: def.base,
          translated: def.translated,
          labelField: def.labelField
        }}
        initialRows={rows}
      />
    </div>
  )
}

export default CollectionScreen
