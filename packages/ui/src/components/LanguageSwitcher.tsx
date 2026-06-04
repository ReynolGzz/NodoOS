'use client'

import * as React from 'react'
import { cn } from '../cn'

export interface LanguageSwitcherProps {
  currentLocale: string
  onSwitch: (locale: string) => void
  className?: string
}

export function LanguageSwitcher({ currentLocale, onSwitch, className }: LanguageSwitcherProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-0.5', className)}>
      {(['es', 'en'] as const).map((locale) => (
        <button
          key={locale}
          onClick={() => onSwitch(locale)}
          className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200',
            currentLocale === locale
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
