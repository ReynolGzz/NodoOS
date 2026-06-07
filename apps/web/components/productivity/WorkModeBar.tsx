'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { PomodoroTimer } from './PomodoroTimer'
import { type ProductivityMode } from '@/hooks/useProductivityMode'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import type { Order } from '@nodo/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const MODE_CONFIG: Record<'work' | 'study', { color: string; label: string; icon: string }> = {
  work:  { color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700', label: 'workActive',  icon: '💻' },
  study: { color: 'bg-green-50  dark:bg-green-900/20  border-green-200  dark:border-green-700',  label: 'studyActive', icon: '📚' },
}

interface WorkModeBarProps {
  mode: 'work' | 'study'
  tableToken: string
  locale: string
  onModeChange: () => void
}

export function WorkModeBar({ mode, tableToken, locale, onModeChange }: WorkModeBarProps) {
  const t = useTranslations('productivity')
  const { addItem } = useCart()
  const { accessToken } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [refilling, setRefilling] = useState(false)
  const cfg = MODE_CONFIG[mode]

  async function handleRefill() {
    if (!accessToken) return
    setRefilling(true)
    try {
      const res = await fetch(`${API}/api/profile/last-order`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) return
      const order: Order = await res.json()
      const first = order.items[0]
      if (!first?.product) return
      addItem({
        id: `refill-${Date.now()}`,
        productId: first.productId,
        product: first.product as any,
        quantity: 1,
        unitPrice: first.unitPrice,
        customizations: first.customizations ?? [],
      })
    } finally {
      setRefilling(false)
    }
  }

  return (
    <div className={`mx-3 my-2 rounded-2xl border ${cfg.color} overflow-hidden`}>
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-2 flex-1"
        >
          <span className="text-base">{cfg.icon}</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t(cfg.label as any)}</span>
          <PomodoroTimer compact />
          <span className="text-xs text-gray-400 ml-auto">{expanded ? '▲' : '▼'}</span>
        </button>
        <div className="flex items-center gap-2 ml-3">
          {accessToken && (
            <button
              onClick={handleRefill}
              disabled={refilling}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-lg active:scale-95 transition-transform border border-brand-200 dark:border-brand-700"
            >
              {refilling ? '...' : t('refill')}
            </button>
          )}
          <button onClick={onModeChange} className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            ✕
          </button>
        </div>
      </div>

      {/* Expanded pomodoro */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-current/10"
          >
            <PomodoroTimer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
