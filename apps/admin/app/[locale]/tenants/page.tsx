import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { TenantDashboard } from '@/components/tenants/TenantDashboard'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ branchId?: string; tenantId?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'admin' })
  return { title: `NODO Admin — ${t('multiSucursal')}` }
}

export default async function TenantsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { branchId, tenantId } = await searchParams

  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
      <TenantDashboard tenantId={tenantId ?? ''} branchId={branchId ?? ''} locale={locale} />
    </Suspense>
  )
}
