import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AnalyticsView } from '@/components/analytics/AnalyticsView'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ branchId?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'admin' })
  return { title: `NODO Admin — ${t('analytics')}` }
}

export default async function AnalyticsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { branchId } = await searchParams

  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
      <AnalyticsView branchId={branchId ?? ''} locale={locale} />
    </Suspense>
  )
}
