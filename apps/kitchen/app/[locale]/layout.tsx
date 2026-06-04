import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { isValidLocale } from '@nodo/i18n'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'NODO Kitchen',
  description: 'Kitchen Display System',
}

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function KitchenLayout({ children, params }: LayoutProps) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} dark`}>
      <body className="bg-gray-950 text-gray-100 antialiased min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
