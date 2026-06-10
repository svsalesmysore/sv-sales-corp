import type { Metadata } from 'next'
import SearchClient from '@/components/search/SearchClient'

export const metadata: Metadata = {
  title: 'Search Products',
  description: 'Search 235 products across 28 categories — Lion Pneumatic Tools & GOWIN hand tools at S V Sales Corporation.',
}

export default function SearchPage() {
  return <SearchClient />
}
