import { getQuote } from '@/lib/actions/quotes'
import { QuoteDetail } from '@/components/quotes/quote-detail'

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quote = await getQuote(id)

  return <QuoteDetail quote={quote} />
}
