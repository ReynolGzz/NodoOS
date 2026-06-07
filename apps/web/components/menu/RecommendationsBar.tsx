'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { Product } from '@nodo/types'

interface RecommendationsBarProps {
  products: Product[]
  locale: string
  onSelect: (product: Product) => void
}

export function RecommendationsBar({ products, locale, onSelect }: RecommendationsBarProps) {
  const t = useTranslations('recommendations')

  if (products.length === 0) return null

  return (
    <div className="py-3">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-4 mb-2">
        {t('forYou')}
      </p>
      <div className="flex gap-3 overflow-x-auto scrollbar-hidden px-4 pb-1">
        {products.map((product, i) => {
          const name = locale === 'en' ? product.nameEn : product.nameEs
          return (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(product)}
              disabled={!product.isAvailable}
              className="flex-shrink-0 w-32 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden text-left active:scale-95 transition-transform shadow-soft"
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={name}
                  className="w-full h-20 object-cover"
                />
              ) : (
                <div className="w-full h-20 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center text-2xl">
                  ☕
                </div>
              )}
              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">{name}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-1">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
