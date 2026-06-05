import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { ProfileView } from '@/components/profile/ProfileView'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string; tableToken: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'profile' })
  return { title: `NODO — ${t('title')}` }
}

export default async function ProfilePage({ params }: Props) {
  const { locale, tableToken } = await params
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>}>
      <ProfileView locale={locale} tableToken={tableToken} />
    </Suspense>
  )
}
