'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { Order } from '@nodo/types'
import { OrderStatus } from '@nodo/types'
import { useOrderSocket } from '@/hooks/useOrderSocket'
import { api } from '@/lib/api'
import { Spinner } from '@nodo/ui'
import { cn } from '@nodo/ui'

const STATUS_STEPS = [
  OrderStatus.RECEIVED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
]

interface OrderTrackingPageProps {
  orderId: string
  tableToken: string
}

export function OrderTrackingPage({ orderId, tableToken }: OrderTrackingPageProps) {
  const t = useTranslations('orderStatus')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Order>(`/api/orders/${orderId}`)
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [orderId])

  const { status: liveStatus, connected } = useOrderSocket({
    orderId,
    onUpdate: (event) => {
      setOrder((prev) => prev ? { ...prev, status: event.status } : prev)
    },
  })

  const currentStatus = liveStatus ?? order?.status ?? OrderStatus.RECEIVED
  const currentStep = STATUS_STEPS.indexOf(currentStatus)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Brand mark */}
      <p className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">NODO</p>

      {/* Status card */}
      <div className="w-full max-w-sm bg-white dark:bg-surface-dark-card rounded-3xl p-6 shadow-soft">
        <div className="text-center mb-8">
          <StatusEmoji status={currentStatus} />
          <h1 className="text-xl font-bold mt-3 text-gray-900 dark:text-gray-100">
            {t(currentStatus)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t(`${currentStatus}Desc`)}
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-between">
          {STATUS_STEPS.slice(0, 4).map((step, idx) => {
            const done = currentStep >= idx
            const active = currentStep === idx
            return (
              <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: active ? 1.15 : 1,
                    backgroundColor: done ? '#c8973a' : '#e5e7eb',
                  }}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                    done ? 'text-white' : 'text-gray-400 dark:text-gray-600'
                  )}
                >
                  {done && idx < currentStep ? '✓' : idx + 1}
                </motion.div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div
                    className={cn(
                      'absolute mt-4 h-0.5 w-full',
                      done && idx < currentStep ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Connection status */}
        {!connected && (
          <p className="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Reconectando...
          </p>
        )}
      </div>

      {order && (
        <p className="mt-4 text-xs text-gray-400">
          {t('orderNumber', { id: order.id.slice(-6).toUpperCase() })}
        </p>
      )}
    </div>
  )
}

function StatusEmoji({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    [OrderStatus.RECEIVED]:  '📋',
    [OrderStatus.PREPARING]: '☕',
    [OrderStatus.READY]:     '🔔',
    [OrderStatus.DELIVERED]: '✅',
    [OrderStatus.CANCELLED]: '❌',
  }
  return (
    <motion.span
      key={status}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-5xl"
    >
      {map[status]}
    </motion.span>
  )
}
