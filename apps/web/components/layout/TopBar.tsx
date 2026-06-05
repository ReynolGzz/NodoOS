'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ThemeToggle, LanguageSwitcher } from '@nodo/ui'
import { useAuth } from '@/hooks/useAuth'

interface TopBarProps {
  branchName: string
  tableNumber: number
  tableToken: string
  locale: string
}

export function TopBar({ branchName, tableNumber, tableToken, locale }: TopBarProps) {
  const t = useTranslations('nav')
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  function handleLocaleSwitch(newLocale: string) {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.replace(segments.join('/'))
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 safe-x safe-top">
      <div>
        <p className="font-display font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
          {branchName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Mesa {tableNumber}</p>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher currentLocale={locale} onSwitch={handleLocaleSwitch} />
        <ThemeToggle />

        {/* Profile button */}
        <button
          onClick={() => router.push(`/${locale}/m/${tableToken}/profile`)}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-600 transition-colors"
          aria-label={t('profile')}
        >
          {user ? (user.name?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase() ?? '?') : '👤'}
        </button>
      </div>
    </header>
  )
}
