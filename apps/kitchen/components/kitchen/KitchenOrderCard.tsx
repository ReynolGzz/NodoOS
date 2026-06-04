'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { Order } from '@nodo/types'
import { OrderStatus } from '@nodo/types'
import { cn } from '@nodo/ui'
import { Button } from '@nodo/ui'

interface KitchenOrderCardProps {
  order: Order
  locale: string
  onStatusChange: (orderId: string, status: OrderStatus) => void
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.RECEIVED]:  'border-yellow-500 bg-yellow-500/10',
  [OrderStatus.PREPARING]: 'border-blue-500 bg-blue-500/10',
  [OrderStatus.READY]:     'border-green-500 bg-green-500/10',
  [OrderStatus.DELIVERED]: 'border-gray-600 bg-gray-800/50',
  [OrderStatus.CANCELLED]: 'border-red-600 bg-red-600/10',
}

export function KitchenOrderCard({ order, locale, onStatusChange }: KitchenOrderCardProps) {
  const t = useTranslations('kitchen')
  const minutesAgo = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)

  function getNextStatus(): OrderStatus | null {
    if (order.status === OrderStatus.RECEIVED) return OrderStatus.PREPARING
    if (order.status === OrderStatus.PREPARING) return OrderStatus.READY
    if (order.status === OrderStatus.READY) return OrderStatus.DELIVERED
    return null
  }

  const nextStatus = getNextStatus()

  const nextStatusLabel: Record<OrderStatus, string> = {
    [OrderStatus.PREPARING]: t('markPreparing'),
    [OrderStatus.READY]:     t('markReady'),
    [OrderStatus.DELIVERED]: t('markDelivered'),
    [OrderStatus.RECEIVED]:  '',
    [OrderStatus.CANCELLED]: '',
  }

  return (
    <div className={cn('rounded-2xl border-2 p-4 flex flex-col gap-3', STATUS_COLORS[order.status])}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white">
          {t('table', { number: order.table?.number ?? '?' })}
        </span>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          minutesAgo > 10 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
        )}>
          {minutesAgo}m
        </span>
      </div>

      {/* Items */}
      <ul className="flex flex-col gap-1.5">
        {order.items.map((item) => {
          const name = locale === 'en' ? item.product?.nameEn : item.product?.nameEs
          return (
            <li key={item.id} className="flex gap-2 text-sm">
              <span className="font-bold text-white w-5 flex-shrink-0">{item.quantity}×</span>
              <div>
                <span className="text-gray-200">{name ?? item.productId}</span>
                {item.customizations.length > 0 && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.customizations.map((c) => c.valueName).join(', ')}
                  </div>
                )}
                {item.notes && <div className="text-xs text-yellow-400 mt-0.5">📝 {item.notes}</div>}
              </div>
            </li>
          )
        })}
      </ul>

      {order.notes && (
        <div className="text-xs text-yellow-400 border border-yellow-500/30 rounded-lg px-2 py-1.5">
          📝 {order.notes}
        </div>
      )}

      {/* Action */}
      {nextStatus && (
        <Button
          size="sm"
          variant={nextStatus === OrderStatus.READY ? 'primary' : 'secondary'}
          className="w-full mt-1"
          onClick={() => onStatusChange(order.id, nextStatus)}
        >
          {nextStatusLabel[nextStatus]}
        </Button>
      )}

      {order.status === OrderStatus.DELIVERED && (
        <p className="text-xs text-center text-gray-600">✓ Entregado</p>
      )}
    </div>
  )
}
