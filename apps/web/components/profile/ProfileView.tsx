'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Spinner } from '@nodo/ui'
import type { Order, Reward, GamificationProfile, CafeEvent } from '@nodo/types'
import { XpProgressBar } from './XpProgressBar'
import { BadgeGrid } from './BadgeGrid'
import { ChallengesList } from './ChallengesList'
import { PointsCard } from './PointsCard'
import { RewardsGrid } from './RewardsGrid'
import { OrderHistoryList } from './OrderHistoryList'
import { ReorderButton } from './ReorderButton'
import { ReservationForm } from '../productivity/ReservationForm'
import type { ReservationDto } from '@nodo/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface ProfileViewProps {
  locale: string
  tableToken: string
}

type Tab = 'progress' | 'challenges' | 'points' | 'history' | 'reserve'

const LEVEL_LABEL_COLORS: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  silver: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  gold:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  black:  'bg-gray-900 text-white',
}

export function ProfileView({ locale, tableToken }: ProfileViewProps) {
  const t = useTranslations('profile')
  const tLevels = useTranslations('levels')
  const tGam = useTranslations('gamification')
  const tProd = useTranslations('productivity')
  const router = useRouter()
  const { user, accessToken, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('progress')
  const [branchId, setBranchId] = useState<string | null>(null)
  const [gamification, setGamification] = useState<GamificationProfile | null>(null)
  const [events, setEvents] = useState<CafeEvent[]>([])
  const [pointsData, setPointsData] = useState<{ balance: number } | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [history, setHistory] = useState<Order[]>([])
  const [reservations, setReservations] = useState<ReservationDto[]>([])
  const [loading, setLoading] = useState(true)

  const headers = { Authorization: `Bearer ${accessToken}` }

  function loadGamification() {
    fetch(`${API}/api/gamification/profile`, { headers })
      .then((r) => r.json())
      .then(setGamification)
      .catch(() => {})
  }

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/${locale}/m/${tableToken}/auth`)
      return
    }

    api.get<{ branch: { id: string } }>(`/api/menu/${tableToken}`)
      .then((data) => {
        const bid = data.branch.id
        setBranchId(bid)
        return Promise.all([
          fetch(`${API}/api/gamification/profile`, { headers }).then((r) => r.json()),
          fetch(`${API}/api/gamification/events?branchId=${bid}`).then((r) => r.json()),
          api.get<{ balance: number }>('/api/profile/points', { headers }),
          api.get<Reward[]>(`/api/profile/rewards?branchId=${bid}`, { headers }),
          api.get<Order[]>('/api/profile/history', { headers }),
          fetch(`${API}/api/productivity/reservations/my`, { headers }).then((r) => r.json()).catch(() => []),
        ])
      })
      .then(([gam, evts, pts, rws, hist, rsvs]) => {
        setGamification(gam)
        setEvents(evts)
        setPointsData(pts)
        setRewards(rws)
        setHistory(hist)
        setReservations(Array.isArray(rsvs) ? rsvs : [])
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, tableToken, locale])

  if (!user) return null
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  }

  const level = gamification?.level ?? user.level ?? 'bronze'
  const levelLabel = tLevels(level as any)

  const TABS: { key: Tab; label: string }[] = [
    { key: 'progress',   label: tGam('progress') },
    { key: 'challenges', label: tGam('challenges') },
    { key: 'points',     label: t('points') },
    { key: 'history',    label: t('history') },
    { key: 'reserve',    label: '📅' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="px-4 pt-safe-top pb-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            ←
          </button>
          <h1 className="font-bold text-gray-900 dark:text-gray-100 flex-1">{t('title')}</h1>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
            {t('logout')}
          </button>
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
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${LEVEL_LABEL_COLORS[level]}`}>
                {levelLabel}
              </span>
              {gamification && (
                <span className="text-xs text-gray-500">{gamification.xp.toLocaleString()} XP</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Lo de siempre */}
      {branchId && (
        <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <ReorderButton tableToken={tableToken} branchId={branchId} locale={locale} />
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        {[
          { label: t('visits'),    value: user.totalVisits },
          { label: 'XP',          value: (gamification?.xp ?? 0).toLocaleString() },
          { label: t('totalSpent'), value: `$${user.totalSpent.toFixed(0)}` },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center py-3 px-2 gap-0.5">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-hidden">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-shrink-0 flex-1 py-3 px-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
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
        {tab === 'progress' && gamification && (
          <div>
            <XpProgressBar profile={gamification} locale={locale} />
            <div className="border-t border-gray-100 dark:border-gray-800">
              <BadgeGrid badges={gamification.badges} locale={locale} />
            </div>
          </div>
        )}

        {tab === 'challenges' && gamification && branchId && (
          <ChallengesList
            challenges={gamification.challenges}
            events={events}
            locale={locale}
            accessToken={accessToken ?? ''}
            branchId={branchId}
            onEventAttend={loadGamification}
          />
        )}

        {tab === 'points' && (
          <div>
            <PointsCard points={pointsData?.balance ?? 0} locale={locale} />
            {branchId && (
              <div className="border-t border-gray-100 dark:border-gray-800 mt-2">
                <RewardsGrid rewards={rewards} locale={locale} userPoints={pointsData?.balance ?? 0} />
              </div>
            )}
          </div>
        )}

        {tab === 'history' && <OrderHistoryList orders={history} locale={locale} />}

        {tab === 'reserve' && branchId && (
          <div className="p-4 space-y-6">
            {/* Upcoming reservations */}
            {reservations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {tProd('myReservations')}
                </p>
                {reservations.map((r) => (
                  <div key={r.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {new Date(r.reservedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' · '}{new Date(r.reservedAt).toLocaleTimeString(locale === 'en' ? 'en-US' : 'es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.partySize} {tProd('people')} · {r.durationMinutes / 60}h{r.mode ? ` · ${r.mode}` : ''}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New reservation form */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                {tProd('reserve')}
              </p>
              <ReservationForm
                branchId={branchId}
                locale={locale}
                accessToken={accessToken ?? ''}
                onSuccess={(r) => setReservations((prev) => [r, ...prev])}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
