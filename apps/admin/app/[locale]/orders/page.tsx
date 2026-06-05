import { Suspense } from 'react'
import { OrdersView } from '@/components/orders/OrdersView'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ branchId?: string }>
}

export default async function OrdersPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { branchId } = await searchParams
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
      <OrdersView branchId={branchId ?? ''} locale={locale} />
    </Suspense>
  )
}
