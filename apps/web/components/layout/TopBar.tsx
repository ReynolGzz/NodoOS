'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ThemeToggle, LanguageSwitcher } from '@nodo/ui'

interface TopBarProps {
  branchName: string
  tableNumber: number
  locale: string
}

export function TopBar({ branchName, tableNumber, locale }: TopBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  function handleLocaleSwitch(newLocale: string) {
    // Replace current locale segment in path
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
      </div>
    </header>
  )
}
