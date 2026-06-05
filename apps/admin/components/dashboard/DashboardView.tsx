'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { AdminLayout } from '../layout/AdminLayout'

interface DashboardStats {
  totalOrdersToday: number
  totalRevenueToday: number
  activeOrders: number
  avgOrderValue: number
}

interface DashboardViewProps {
  branchId: string
  locale: string
}

export function DashboardView({ branchId, locale }: DashboardViewProps) {
  const t = useTranslations('admin')
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    if (!branchId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/admin/dashboard?branchId=${branchId}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
  }, [branchId])

  const cards = [
    { label: t('todayOrders'), value: stats?.totalOrdersToday ?? '-', icon: '📋' },
    { label: t('todayRevenue'), value: stats ? `$${stats.totalRevenueToday.toFixed(2)}` : '-', icon: '💰' },
    { label: t('activeOrders'), value: stats?.activeOrders ?? '-', icon: '⏳' },
    { label: t('avgOrder'), value: stats ? `$${stats.avgOrderValue.toFixed(2)}` : '-', icon: '📊' },
  ]

  return (
    <AdminLayout locale={locale} branchId={branchId}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard')}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-soft"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
