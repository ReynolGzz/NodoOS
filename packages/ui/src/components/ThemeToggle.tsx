'use client'

import * as React from 'react'
import { cn } from '../cn'

export interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    const stored = localStorage.getItem('nodo-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = (stored ?? (prefersDark ? 'dark' : 'light')) as 'light' | 'dark'
    setTheme(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [])

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('nodo-theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        theme === 'dark' ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700',
        className
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center text-xs',
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
        )}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
