import { KitchenDisplay } from '@/components/kitchen/KitchenDisplay'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ branchId?: string }>
}

export default async function KitchenPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { branchId } = await searchParams

  return <KitchenDisplay branchId={branchId ?? ''} locale={locale} />
}
