'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { Category } from '@nodo/types'
import { cn } from '@nodo/ui'

interface CategoryTabsProps {
  categories: Category[]
  activeId: string | null
  onSelect: (id: string | null) => void
  locale: string
}

export function CategoryTabs({ categories, activeId, onSelect, locale }: CategoryTabsProps) {
  const t = useTranslations('menu')
  const scrollRef = useRef<HTMLDivElement>(null)

  function getName(cat: Category) {
    return locale === 'en' ? cat.nameEn : cat.nameEs
  }

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hidden"
    >
      <Tab
        label={t('allCategories')}
        active={activeId === null}
        onClick={() => onSelect(null)}
      />
      {categories.map((cat) => (
        <Tab
          key={cat.id}
          label={getName(cat)}
          active={activeId === cat.id}
          onClick={() => onSelect(cat.id)}
        />
      ))}
    </div>
  )
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200',
        active
          ? 'text-white'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      )}
    >
      {active && (
        <motion.span
          layoutId="category-tab-bg"
          className="absolute inset-0 rounded-full bg-brand-500"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}
