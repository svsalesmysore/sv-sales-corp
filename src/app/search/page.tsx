import type { Metadata } from 'next'
import SearchClient from '@/components/search/SearchClient'

export const metadata: Metadata = {
  title: 'Search Products',
  description: 'Search all 198 products across 14 categories at S V Sales Corporation.',
}

export default function SearchPage() {
  return <SearchClient />
}
