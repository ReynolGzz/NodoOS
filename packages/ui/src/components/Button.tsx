'use client'

import * as React from 'react'
import { cn } from '../cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-brand': variant === 'primary',
            'bg-surface-elevated dark:bg-surface-dark-card text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700': variant === 'secondary',
            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600 active:bg-red-700': variant === 'danger',
            'h-8 px-3 text-sm gap-1.5': size === 'sm',
            'h-10 px-4 text-sm gap-2': size === 'md',
            'h-12 px-6 text-base gap-2': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
