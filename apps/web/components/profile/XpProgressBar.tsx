'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { UserLevel, GamificationProfile } from '@nodo/types'

const LEVEL_COLORS: Record<UserLevel, string> = {
  bronze: 'from-amber-400 to-amber-600',
  silver: 'from-gray-300 to-gray-500',
  gold:   'from-yellow-400 to-yellow-600',
  black:  'from-gray-700 to-gray-900',
}

const LEVEL_LABEL_COLORS: Record<UserLevel, string> = {
  bronze: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  silver: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  gold:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  black:  'bg-gray-900 text-white',
}

interface XpProgressBarProps {
  profile: GamificationProfile
  locale: string
}

export function XpProgressBar({ profile, locale }: XpProgressBarProps) {
  const t = useTranslations('gamification')
  const tLevels = useTranslations('levels')

  const earnedCount = profile.badges.filter((b) => b.earned).length
  const levelLabel = tLevels(profile.level as any)
  const nextLabel = profile.next ? tLevels(profile.next as any) : null

  return (
    <div className="p-4 space-y-4">
      {/* Level header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${LEVEL_LABEL_COLORS[profile.level]}`}>
            {levelLabel}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {t('xp', { xp: profile.xp.toLocaleString() })}
          </span>
        </div>
        {profile.next && (
          <span className="text-xs text-gray-400">
            {t('xpToNext', { xp: profile.xpToNext, level: nextLabel })}
          </span>
        )}
        {!profile.next && (
          <span className="text-xs font-bold text-brand-500">{t('maxLevel')}</span>
        )}
      </div>

      {/* XP progress bar */}
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${LEVEL_COLORS[profile.level]}`}
          initial={{ width: 0 }}
          animate={{ width: `${profile.progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{profile.xp.toLocaleString()}</p>
          <p className="text-xs text-gray-500">XP total</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{earnedCount}</p>
          <p className="text-xs text-gray-500">{t('badges')}</p>
        </div>
      </div>
    </div>
  )
}
