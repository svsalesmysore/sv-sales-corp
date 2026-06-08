import type { Metadata } from 'next'
import QuotePageClient from '@/components/quote/QuotePageClient'

export const metadata: Metadata = {
  title: 'Request a Quote',
  description: 'Add products to your quote cart and request wholesale pricing from S V Sales Corporation.',
}

export default function QuotePage() {
  return <QuotePageClient />
}
