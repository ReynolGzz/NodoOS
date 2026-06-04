import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ branchId?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'admin' })
  return { title: `NODO Admin — ${t('dashboard')}` }
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { branchId } = await searchParams

  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
      <DashboardView branchId={branchId ?? ''} locale={locale} />
    </Suspense>
  )
}
