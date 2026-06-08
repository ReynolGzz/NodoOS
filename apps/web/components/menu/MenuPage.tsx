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
import { WorkModeBar } from '../productivity/WorkModeBar'
import { ModeSelector } from '../productivity/ModeSelector'
import { useProductivityMode } from '@/hooks/useProductivityMode'
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
  const [secretItems, setSecretItems] = useState<Array<{ product: Product }>>([])
  const [modeSelectorOpen, setModeSelectorOpen] = useState(false)
  const { setTableToken } = useCart()
  const { user, accessToken } = useAuth()
  const { mode, setMode } = useProductivityMode()
  const isWorkMode = mode === 'work' || mode === 'study'

  // Apply white-label branding as CSS variables
  useEffect(() => {
    const branding = (menuData as any)?.branding
    if (!branding) return
    const root = document.documentElement
    if (branding.primaryColor) root.style.setProperty('--color-brand', branding.primaryColor)
    if (branding.accentColor)  root.style.setProperty('--color-accent', branding.accentColor)
    if (branding.fontFamily)   root.style.setProperty('--font-display', branding.fontFamily)
    return () => {
      root.style.removeProperty('--color-brand')
      root.style.removeProperty('--color-accent')
      root.style.removeProperty('--font-display')
    }
  }, [menuData])

  useEffect(() => {
    setTableToken(tableToken)
    api.get<MenuData>(`/api/menu/${tableToken}`)
      .then((data) => {
        setMenuData(data)
        setActiveCategory(data.categories[0]?.id ?? null)

        // Fetch personalized recommendations
        const params = new URLSearchParams({ branchId: data.branch.id, locale })
        if (user?.id) params.set('userId', user.id)
        if (user?.name) params.set('userName', user.name)
        fetch(`${API}/api/recommendations?${params}`)
          .then((r) => r.json())
          .then(setRecommendations)
          .catch(() => {})

        // Fetch secret menu if authenticated
        if (accessToken) {
          fetch(`${API}/api/gamification/secret-menu`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
            .then((r) => r.json())
            .then(setSecretItems)
            .catch(() => {})
        }
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
        <div className="flex items-center">
          <div className="flex-1">
            <CategoryTabs
              categories={menuData.categories}
              activeId={activeCategory}
              onSelect={setActiveCategory}
              locale={locale}
            />
          </div>
          {/* Mode button */}
          <button
            onClick={() => setModeSelectorOpen(true)}
            className="px-3 py-2 mr-2 flex-shrink-0 text-lg"
            title={mode}
          >
            {mode === 'casual' ? '🛋️' : mode === 'work' ? '💻' : mode === 'study' ? '📚' : '🤝'}
          </button>
        </div>
      </div>

      <main className="flex-1 pb-32 safe-x">
        {/* Work / Study mode bar */}
        {isWorkMode && (
          <WorkModeBar
            mode={mode as 'work' | 'study'}
            tableToken={tableToken}
            branchId={menuData.branch.id}
            locale={locale}
            onModeChange={() => setMode('casual')}
          />
        )}

        {/* Personalized greeting (hidden in work mode) */}
        {!isWorkMode && recommendations?.greeting && (
          <PersonalizedGreeting greeting={recommendations.greeting} />
        )}

        {/* Recommendations bar (hidden in work mode) */}
        {!isWorkMode && !activeCategory && recommendations?.products && recommendations.products.length > 0 && (
          <RecommendationsBar
            products={recommendations.products}
            locale={locale}
            onSelect={setSelectedProduct}
          />
        )}

        {/* Secret menu — shown only when user has unlocked items */}
        {!activeCategory && secretItems.length > 0 && (
          <div className="py-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 mb-2 flex items-center gap-1">
              <span>🔓</span>
              {locale === 'en' ? 'Secret Menu' : 'Menú Secreto'}
            </p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hidden px-4 pb-1">
              {secretItems.map((item) => {
                const name = locale === 'en' ? item.product.nameEn : item.product.nameEs
                return (
                  <motion.button
                    key={item.product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSelectedProduct(item.product)}
                    className="flex-shrink-0 w-32 bg-gray-900 dark:bg-gray-800 rounded-2xl overflow-hidden text-left active:scale-95 transition-transform ring-1 ring-brand-500/30"
                  >
                    <div className="w-full h-20 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-2xl">
                      🤫
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-white line-clamp-2 leading-tight">{name}</p>
                      <p className="text-xs text-brand-400 font-semibold mt-1">${item.product.price.toFixed(2)}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
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

      <ModeSelector open={modeSelectorOpen} onClose={() => setModeSelectorOpen(false)} />

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
