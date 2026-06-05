'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { Order } from '@nodo/types'
import { OrderStatus } from '@nodo/types'
import { AdminLayout } from '../layout/AdminLayout'
import { Badge } from '@nodo/ui'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const STATUS_BADGE = {
  [OrderStatus.RECEIVED]:  { label: 'Recibido',   variant: 'default' as const },
  [OrderStatus.PREPARING]: { label: 'Preparando', variant: 'warning' as const },
  [OrderStatus.READY]:     { label: 'Listo',      variant: 'info' as const },
  [OrderStatus.DELIVERED]: { label: 'Entregado',  variant: 'success' as const },
  [OrderStatus.CANCELLED]: { label: 'Cancelado',  variant: 'danger' as const },
}

interface OrdersViewProps {
  branchId: string
  locale: string
}

export function OrdersView({ branchId, locale }: OrdersViewProps) {
  const t = useTranslations('admin')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!branchId) return
    fetch(`${API}/api/admin/orders?branchId=${branchId}`)
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [branchId])

  return (
    <AdminLayout locale={locale} branchId={branchId}>
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('orders')}</h1>

        {loading ? (
          <div className="flex justify-center py-8 text-gray-400">Cargando...</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const { label, variant } = STATUS_BADGE[order.status]
              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        Mesa {order.table?.number ?? '?'}
                      </span>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                    <span className="font-bold text-brand-500">${order.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {order.items.length} artículo{order.items.length !== 1 ? 's' : ''} ·{' '}
                    {new Date(order.createdAt).toLocaleTimeString(locale === 'en' ? 'en-US' : 'es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )
            })}
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-400">Sin órdenes recientes</div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
