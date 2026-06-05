import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { ProductsManager } from '@/components/products/ProductsManager'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ branchId?: string }>
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { branchId } = await searchParams
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
      <ProductsManager branchId={branchId ?? ''} locale={locale} />
    </Suspense>
  )
}
