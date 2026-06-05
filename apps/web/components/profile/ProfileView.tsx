'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Badge, Button, Spinner } from '@nodo/ui'
import type { Order, Reward } from '@nodo/types'
import { PointsCard } from './PointsCard'
import { RewardsGrid } from './RewardsGrid'
import { OrderHistoryList } from './OrderHistoryList'
import { ReorderButton } from './ReorderButton'

interface ProfileViewProps {
  locale: string
  tableToken: string
}

type Tab = 'points' | 'history' | 'rewards'

export function ProfileView({ locale, tableToken }: ProfileViewProps) {
  const t = useTranslations('profile')
  const tLoyalty = useTranslations('loyalty')
  const tLevels = useTranslations('levels')
  const router = useRouter()
  const { user, accessToken, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('points')
  const [pointsData, setPointsData] = useState<{ balance: number } | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [history, setHistory] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [branchId, setBranchId] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/${locale}/m/${tableToken}/auth`)
      return
    }

    const headers = { Authorization: `Bearer ${accessToken}` }

    // Get branchId from table context
    api.get<{ branch: { id: string } }>(`/api/menu/${tableToken}`)
      .then((data) => {
        const bid = data.branch.id
        setBranchId(bid)
        return Promise.all([
          api.get<{ balance: number }>('/api/profile/points', { headers }),
          api.get<Reward[]>(`/api/profile/rewards?branchId=${bid}`, { headers }),
          api.get<Order[]>('/api/profile/history', { headers }),
        ])
      })
      .then(([pts, rws, hist]) => {
        setPointsData(pts)
        setRewards(rws)
        setHistory(hist)
      })
      .finally(() => setLoading(false))
  }, [accessToken, tableToken, locale, router])

  if (!user) return null

  const levelLabel = tLevels((user.level ?? 'bronze') as any)
  const levelColors: Record<string, string> = {
    bronze: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    silver: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    gold:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    black:  'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-surface-dark">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 bg-white dark:bg-surface-dark-card border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            ←
          </button>
          <h1 className="font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-xl font-bold text-brand-600">
            {user.name?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {user.name ?? user.email ?? 'Usuario'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColors[user.level ?? 'bronze']}`}>
                {levelLabel}
              </span>
              <span className="text-xs text-gray-500">{pointsData?.balance ?? user.totalPoints} pts</span>
            </div>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            Salir
          </button>
        </div>
      </header>

      {/* "Lo de siempre" reorder */}
      {branchId && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <ReorderButton tableToken={tableToken} branchId={branchId} locale={locale} />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 bg-white dark:bg-surface-dark-card border-b border-gray-100 dark:border-gray-800">
        {[
          { label: t('visits'),  value: user.totalVisits },
          { label: t('points'),  value: pointsData?.balance ?? user.totalPoints },
          { label: t('totalSpent'), value: `$${user.totalSpent.toFixed(0)}` },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center py-3 px-2 gap-0.5">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-surface-dark-card border-b border-gray-100 dark:border-gray-800">
        {([
          { key: 'points' as Tab,  label: t('points') },
          { key: 'rewards' as Tab, label: 'Rewards' },
          { key: 'history' as Tab, label: t('history') },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-8">
        {tab === 'points' && <PointsCard points={pointsData?.balance ?? 0} locale={locale} />}
        {tab === 'rewards' && (
          <RewardsGrid rewards={rewards} locale={locale} userPoints={pointsData?.balance ?? 0} />
        )}
        {tab === 'history' && <OrderHistoryList orders={history} locale={locale} />}
      </div>
    </div>
  )
}
