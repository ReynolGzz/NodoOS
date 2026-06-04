'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { Product } from '@nodo/types'
import { cn } from '@nodo/ui'

interface ProductCardProps {
  product: Product
  locale: string
  onSelect: () => void
}

export function ProductCard({ product, locale, onSelect }: ProductCardProps) {
  const t = useTranslations('menu')
  const name = locale === 'en' ? product.nameEn : product.nameEs
  const description = locale === 'en' ? product.descriptionEn : product.descriptionEs

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={product.isAvailable ? onSelect : undefined}
      className={cn(
        'relative flex flex-col rounded-3xl overflow-hidden bg-white dark:bg-surface-dark-card shadow-soft text-left transition-shadow hover:shadow-md',
        !product.isAvailable && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">☕</div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-medium px-2 py-1 bg-black/60 rounded-full">
              {t('unavailable')}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1">
        <p className="font-semibold text-sm leading-tight line-clamp-2 text-gray-900 dark:text-gray-100">
          {name}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{description}</p>
        )}
        <p className="mt-1 font-bold text-brand-500 text-sm">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </motion.button>
  )
}
