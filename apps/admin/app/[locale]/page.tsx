import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ branchId?: string }>
}

export default async function AdminRoot({ params, searchParams }: Props) {
  const { locale } = await params
  const { branchId } = await searchParams
  redirect(`/${locale}/dashboard${branchId ? `?branchId=${branchId}` : ''}`)
}
