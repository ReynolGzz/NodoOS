import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { CampaignsView } from '@/components/campaigns/CampaignsView'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ branchId?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'admin' })
  return { title: `NODO Admin — ${t('campaigns')}` }
}

export default async function CampaignsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { branchId } = await searchParams

  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
      <CampaignsView branchId={branchId ?? ''} locale={locale} />
    </Suspense>
  )
}
