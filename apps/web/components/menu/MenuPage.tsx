'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import type { MenuData, Product, RecommendationResult } from '@nodo/types'
import { api } from '@/lib/api'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { CategoryTabs } from './CategoryTabs'
import { ProductGrid } from './ProductGrid'
import { ProductModal } from './ProductModal'
import { PersonalizedGreeting } from './PersonalizedGreeting'
import { RecommendationsBar } from './RecommendationsBar'
import { CartBar } from '../cart/CartBar'
import { TopBar } from '../layout/TopBar'
import { Spinner } from '@nodo/ui'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface MenuPageProps {
  tableToken: string
  locale: string
}

export function MenuPage({ tableToken, locale }: MenuPageProps) {
  const tErrors = useTranslations('errors')
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null)
  const { setTableToken } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    setTableToken(tableToken)
    api.get<MenuData>(`/api/menu/${tableToken}`)
      .then((data) => {
        setMenuData(data)
        setActiveCategory(data.categories[0]?.id ?? null)

        // Fetch personalized recommendations after menu loads
        const params = new URLSearchParams({ branchId: data.branch.id, locale })
        if (user?.id) params.set('userId', user.id)
        if (user?.name) params.set('userName', user.name)
        fetch(`${API}/api/recommendations?${params}`)
          .then((r) => r.json())
          .then(setRecommendations)
          .catch(() => {})
      })
      .catch(() => setError(tErrors('tableNotFound')))
      .finally(() => setLoading(false))
  }, [tableToken, locale, user, setTableToken, tErrors])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-4xl mb-4">☕</p>
          <p className="text-gray-600 dark:text-gray-400">{error ?? tErrors('menuNotAvailable')}</p>
        </div>
      </div>
    )
  }

  const filteredProducts = activeCategory
    ? menuData.products.filter((p) => p.categoryId === activeCategory)
    : menuData.products

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        branchName={menuData.branch.name}
        tableNumber={menuData.table.number}
        tableToken={tableToken}
        locale={locale}
      />

      <div className="sticky top-0 z-10 bg-surface dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 safe-x">
        <CategoryTabs
          categories={menuData.categories}
          activeId={activeCategory}
          onSelect={setActiveCategory}
          locale={locale}
        />
      </div>

      <main className="flex-1 pb-32 safe-x">
        {/* Personalized greeting */}
        {recommendations?.greeting && (
          <PersonalizedGreeting greeting={recommendations.greeting} />
        )}

        {/* Recommendations bar — only shows on the "all" view (no active category filter) */}
        {!activeCategory && recommendations?.products && recommendations.products.length > 0 && (
          <RecommendationsBar
            products={recommendations.products}
            locale={locale}
            onSelect={setSelectedProduct}
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory ?? 'all'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <ProductGrid
              products={filteredProducts}
              locale={locale}
              onSelect={setSelectedProduct}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <CartBar tableToken={tableToken} locale={locale} />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          locale={locale}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
