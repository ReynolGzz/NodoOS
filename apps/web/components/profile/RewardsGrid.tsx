'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import type { Reward } from '@nodo/types'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Button, cn } from '@nodo/ui'

interface RewardsGridProps {
  rewards: Reward[]
  userPoints: number
  locale: string
}

export function RewardsGrid({ rewards, userPoints, locale }: RewardsGridProps) {
  const t = useTranslations('loyalty')
  const { accessToken } = useAuth()
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)

  const typeIcons: Record<string, string> = {
    discount:  '💸',
    free_item: '🎁',
    upgrade:   '⬆️',
    refill:    '♻️',
  }

  async function handleRedeem(reward: Reward) {
    if (!accessToken) return
    setLoading(reward.id)
    try {
      await api.post('/api/profile/rewards/redeem', { rewardId: reward.id }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      setRedeemed((prev) => new Set(prev).add(reward.id))
    } catch {
      // show error
    } finally {
      setLoading(null)
    }
  }

  if (rewards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <span className="text-4xl mb-3">🎁</span>
        <p className="text-sm">{t('noRewards')}</p>
      </div>
    )
  }

  return (
    <div className="p-4 grid grid-cols-1 gap-3">
      {rewards.map((reward) => {
        const name = locale === 'en' ? reward.nameEn : reward.nameEs
        const canRedeem = userPoints >= reward.pointsCost
        const isRedeemed = redeemed.has(reward.id)

        return (
          <div
            key={reward.id}
            className={cn(
              'rounded-2xl p-4 border-2 flex items-center gap-4',
              canRedeem
                ? 'border-brand-200 dark:border-brand-800 bg-white dark:bg-surface-dark-card'
                : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60'
            )}
          >
            <span className="text-3xl">{typeIcons[reward.rewardType]}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{name}</p>
              <p className="text-xs text-brand-500 font-medium">
                {t('pointsFor', { points: reward.pointsCost })}
              </p>
            </div>
            <Button
              size="sm"
              variant={isRedeemed ? 'secondary' : 'primary'}
              disabled={!canRedeem || isRedeemed}
              loading={loading === reward.id}
              onClick={() => handleRedeem(reward)}
            >
              {isRedeemed ? t('redeemed') : t('redeem')}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
