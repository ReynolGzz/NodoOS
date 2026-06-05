import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { AuthModal } from '@/components/auth/AuthModal'

interface Props {
  params: Promise<{ locale: string; tableToken: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })
  return { title: `NODO — ${t('signIn')}` }
}

export default async function AuthPage({ params }: Props) {
  const { locale, tableToken } = await params
  return <AuthModal locale={locale} tableToken={tableToken} />
}
