'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ThemeToggle, LanguageSwitcher } from '@nodo/ui'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface AdminLayoutProps {
  children: React.ReactNode
  locale: string
  branchId: string
}

// First 4 items appear in mobile bottom nav; rest only in sidebar
const NAV_ITEMS = [
  { href: 'dashboard',  icon: '📊', labelKey: 'dashboard',    mobile: true },
  { href: 'orders',     icon: '📋', labelKey: 'orders',        mobile: true },
  { href: 'products',   icon: '☕', labelKey: 'products',      mobile: true },
  { href: 'analytics',  icon: '📈', labelKey: 'analytics',     mobile: true },
  { href: 'tables',     icon: '🪑', labelKey: 'tables',        mobile: false },
  { href: 'campaigns',  icon: '📢', labelKey: 'campaigns',     mobile: false },
  { href: 'tenants',    icon: '🏢', labelKey: 'multiSucursal', mobile: false },
  { href: 'billing',    icon: '💳', labelKey: 'billing',       mobile: false },
]

export function AdminLayout({ children, locale, branchId }: AdminLayoutProps) {
  const t = useTranslations('admin')
  const router = useRouter()
  const pathname = usePathname()
  const { token, loading, logout } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!token) return null

  function navigate(href: string) {
    router.push(`/${locale}/${href}?branchId=${branchId}`)
  }

  function handleLocaleSwitch(newLocale: string) {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.replace(segments.join('/'))
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <p className="font-display font-bold text-gray-900 dark:text-gray-100">NODO Admin</p>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} onSwitch={handleLocaleSwitch} />
          <ThemeToggle />
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            {t('logout' as any) ?? 'Salir'}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-52 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 hidden md:flex flex-col py-4">
          {NAV_ITEMS.map(({ href, icon, labelKey }) => {
            const isActive = pathname.includes(`/${href}`)
            return (
              <button
                key={href}
                onClick={() => navigate(href)}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-r-2 border-brand-500'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span>{icon}</span>
                <span>{t(labelKey as any)}</span>
              </button>
            )
          })}
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — only primary 4 items */}
      <nav className="md:hidden flex border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        {NAV_ITEMS.filter((i) => i.mobile).map(({ href, icon, labelKey }) => {
          const isActive = pathname.includes(`/${href}`)
          return (
            <button
              key={href}
              onClick={() => navigate(href)}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-0.5 ${
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span>{t(labelKey as any)}</span>
            </button>
          )
        })}
        {/* More button */}
        <button
          onClick={() => navigate('tables')}
          className="flex-1 flex flex-col items-center py-2 text-xs gap-0.5 text-gray-500"
        >
          <span className="text-xl">⋯</span>
          <span>Más</span>
        </button>
      </nav>
    </div>
  )
}
