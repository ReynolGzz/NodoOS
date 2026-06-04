'use client'

import { useTranslations } from 'next-intl'
import type { Product } from '@nodo/types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  locale: string
  onSelect: (product: Product) => void
}

export function ProductGrid({ products, locale, onSelect }: ProductGridProps) {
  const t = useTranslations('menu')

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-4xl mb-3">☕</span>
        <p className="text-sm">{t('noProducts')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          onSelect={() => onSelect(product)}
        />
      ))}
    </div>
  )
}
