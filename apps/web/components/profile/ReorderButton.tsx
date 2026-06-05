'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { api } from '@/lib/api'
import type { Order } from '@nodo/types'
import { Button } from '@nodo/ui'

interface ReorderButtonProps {
  tableToken: string
  branchId: string
  locale: string
}

export function ReorderButton({ tableToken, branchId, locale }: ReorderButtonProps) {
  const t = useTranslations('loyalty')
  const { accessToken } = useAuth()
  const { addItem, clearCart } = useCart()
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!accessToken) return
    api.get<Order | null>(`/api/profile/last-order?branchId=${branchId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(setLastOrder)
      .catch(() => setLastOrder(null))
  }, [accessToken, branchId])

  if (!lastOrder || lastOrder.items.length === 0) return null

  async function handleReorder() {
    if (!lastOrder) return
    setLoading(true)
    clearCart()
    for (const item of lastOrder.items) {
      if (!item.product) continue
      addItem(item.product, item.quantity, item.customizations, item.notes ?? undefined)
    }
    setDone(true)
    setLoading(false)
    setTimeout(() => setDone(false), 2000)
  }

  const preview = lastOrder.items
    .slice(0, 2)
    .map((i) => locale === 'en' ? i.product?.nameEn : i.product?.nameEs)
    .filter(Boolean)
    .join(', ')

  return (
    <button
      onClick={handleReorder}
      disabled={loading}
      className="w-full flex items-center gap-3 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-2xl p-3 transition-colors text-left"
    >
      <span className="text-2xl">☕</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-brand-700 dark:text-brand-300">{t('loDeSimple')}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{preview}</p>
      </div>
      <AnimatePresence mode="wait">
        {done ? (
          <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 text-lg">
            ✓
          </motion.span>
        ) : (
          <motion.span key="arrow" className="text-brand-500 text-sm font-bold">
            +
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
