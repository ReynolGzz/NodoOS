import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { CheckoutPage } from '@/components/checkout/CheckoutPage'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string; tableToken: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'checkout' })
  return { title: `NODO — ${t('title')}` }
}

export default async function CheckoutRoute({ params }: Props) {
  const { tableToken, locale } = await params
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      <CheckoutPage tableToken={tableToken} locale={locale} />
    </Suspense>
  )
}
