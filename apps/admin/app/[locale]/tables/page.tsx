import { Suspense } from 'react'
import { TablesManager } from '@/components/tables/TablesManager'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ branchId?: string }>
}

export default async function TablesPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { branchId } = await searchParams
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
      <TablesManager branchId={branchId ?? ''} locale={locale} />
    </Suspense>
  )
}
