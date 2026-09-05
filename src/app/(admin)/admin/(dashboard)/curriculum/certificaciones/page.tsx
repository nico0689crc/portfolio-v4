// Component Imports
import CollectionScreen from '@/components/admin/views/collections/CollectionScreen'

// Lib Imports
import { COLLECTIONS } from '@/lib/admin/collections'

const def = COLLECTIONS.certificaciones

export const metadata = { title: def.title }

const Page = () => <CollectionScreen def={def} />

export default Page
