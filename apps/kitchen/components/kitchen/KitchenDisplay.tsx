'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import type { Order } from '@nodo/types'
import { OrderStatus } from '@nodo/types'
import { useKitchenSocket } from '@/hooks/useKitchenSocket'
import { KitchenOrderCard } from './KitchenOrderCard'
import { ThemeToggle, LanguageSwitcher, Badge } from '@nodo/ui'

interface KitchenDisplayProps {
  branchId: string
  locale: string
  onReset?: () => void
}

export function KitchenDisplay({ branchId, locale, onReset }: KitchenDisplayProps) {
  const t = useTranslations('kitchen')
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  useEffect(() => {
    if (!branchId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/kitchen/orders?branchId=${branchId}`)
      .then((r) => r.json())
      .then(setOrders)
      .catch(console.error)
  }, [branchId])

  const { connected, updateStatus } = useKitchenSocket({
    branchId,
    onNewOrder: (event) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === event.order.id)
        if (exists) return prev
        return [event.order, ...prev]
      })
    },
    onStatusChanged: (event) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === event.orderId ? { ...o, status: event.status } : o))
      )
    },
  })

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    await updateStatus(orderId, status)
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
  }

  const activeOrders = orders.filter((o) =>
    [OrderStatus.RECEIVED, OrderStatus.PREPARING].includes(o.status)
  )
  const displayOrders = filter === 'active' ? activeOrders : orders

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{t('title')}</h1>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400 animate-pulse'}`} />
          {activeOrders.length > 0 && (
            <Badge variant="warning">{activeOrders.length} {t('activeOrders')}</Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-gray-700">
            {(['active', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm ${filter === f ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {f === 'active' ? t('activeOrders') : t('allOrders')}
              </button>
            ))}
          </div>
          <LanguageSwitcher currentLocale={locale} onSwitch={() => {}} />
          {onReset && (
            <button
              onClick={onReset}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2"
              title="Cambiar configuración"
            >
              ⚙
            </button>
          )}
        </div>
      </header>

      {/* Orders grid */}
      <main className="flex-1 p-6 overflow-auto">
        {displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600">
            <span className="text-5xl mb-3">✓</span>
            <p>{t('noActiveOrders')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {displayOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                >
                  <KitchenOrderCard
                    order={order}
                    locale={locale}
                    onStatusChange={handleStatusChange}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
