import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { OrderTrackingPage } from '@/components/order/OrderTrackingPage'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string; tableToken: string; orderId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'orderStatus' })
  return { title: `NODO — ${t('title')}` }
}

export default async function OrderStatusPage({ params }: Props) {
  const { orderId, tableToken } = await params

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <OrderTrackingPage orderId={orderId} tableToken={tableToken} />
    </Suspense>
  )
}
