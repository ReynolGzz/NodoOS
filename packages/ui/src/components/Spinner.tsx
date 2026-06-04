import * as React from 'react'
import { cn } from '../cn'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn(
        'animate-spin text-brand-500',
        { 'w-4 h-4': size === 'sm', 'w-6 h-6': size === 'md', 'w-8 h-8': size === 'lg' },
        className
      )}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
