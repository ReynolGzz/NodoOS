'use client'

import { useTranslations } from 'next-intl'
import type { Order } from '@nodo/types'
import { OrderStatus } from '@nodo/types'
import { Badge } from '@nodo/ui'

const STATUS_BADGE: Record<OrderStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' | 'default' }> = {
  [OrderStatus.DELIVERED]: { label: 'Entregado', variant: 'success' },
  [OrderStatus.READY]:     { label: 'Listo',     variant: 'info' },
  [OrderStatus.PREPARING]: { label: 'Preparando', variant: 'warning' },
  [OrderStatus.RECEIVED]:  { label: 'Recibido',  variant: 'default' },
  [OrderStatus.CANCELLED]: { label: 'Cancelado', variant: 'danger' },
}

interface OrderHistoryListProps {
  orders: Order[]
  locale: string
}

export function OrderHistoryList({ orders, locale }: OrderHistoryListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-4xl mb-3">📋</span>
        <p className="text-sm">Sin órdenes todavía</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {orders.map((order) => {
        const { label, variant } = STATUS_BADGE[order.status]
        const date = new Date(order.createdAt).toLocaleDateString(
          locale === 'en' ? 'en-US' : 'es-MX',
          { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        )
        const itemNames = order.items.map((i) =>
          locale === 'en' ? i.product?.nameEn : i.product?.nameEs
        ).filter(Boolean).join(', ')

        return (
          <div
            key={order.id}
            className="bg-white dark:bg-surface-dark-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{date}</span>
              <Badge variant={variant}>{label}</Badge>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">{itemNames}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Mesa {order.table?.number}</span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
