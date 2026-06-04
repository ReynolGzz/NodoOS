import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { MenuPage } from '@/components/menu/MenuPage'
import { Spinner } from '@nodo/ui'

interface Props {
  params: Promise<{ locale: string; tableToken: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'menu' })
  return { title: `NODO — ${t('title')}` }
}

export default async function TableMenuPage({ params }: Props) {
  const { tableToken, locale } = await params

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <MenuPage tableToken={tableToken} locale={locale} />
    </Suspense>
  )
}
