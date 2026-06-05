'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

interface PointsCardProps {
  points: number
  locale: string
}

const LEVELS = [
  { name: 'bronze', min: 0,     max: 499,   emoji: '🥉' },
  { name: 'silver', min: 500,   max: 1999,  emoji: '🥈' },
  { name: 'gold',   min: 2000,  max: 9999,  emoji: '🥇' },
  { name: 'black',  min: 10000, max: Infinity, emoji: '⬛' },
]

export function PointsCard({ points }: PointsCardProps) {
  const t = useTranslations('loyalty')
  const tLevels = useTranslations('levels')

  const currentLevel = LEVELS.find((l) => points >= l.min && points <= l.max)!
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1]
  const progress = nextLevel
    ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100

  return (
    <div className="p-4 space-y-4">
      {/* Balance card */}
      <div className="bg-gradient-to-br from-brand-400 to-brand-600 rounded-3xl p-6 text-white">
        <p className="text-sm opacity-80 mb-1">{t('pointsBalance', { points: '' }).replace(': ', '')}</p>
        <p className="text-5xl font-bold">{points.toLocaleString()}</p>
        <p className="text-sm opacity-80 mt-1">{t('points', { count: points })}</p>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-2xl">{currentLevel.emoji}</span>
          <span className="font-semibold">{tLevels(currentLevel.name as any)}</span>
        </div>
      </div>

      {/* Progress to next level */}
      {nextLevel && (
        <div className="bg-white dark:bg-surface-dark-card rounded-2xl p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              {tLevels(currentLevel.name as any)} → {tLevels(nextLevel.name as any)}
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {(nextLevel.min - points).toLocaleString()} pts
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-brand-500 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            {points.toLocaleString()} / {nextLevel.min.toLocaleString()} pts para {nextLevel.emoji} {tLevels(nextLevel.name as any)}
          </p>
        </div>
      )}

      {/* How to earn */}
      <div className="bg-white dark:bg-surface-dark-card rounded-2xl p-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Cómo ganar puntos</p>
        <div className="space-y-2">
          {[
            { label: 'Por cada $10 gastados', value: '1 pt', icon: '☕' },
            { label: 'Por cada visita',         value: '5 pts', icon: '📍' },
            { label: 'Referir un amigo',         value: '100 pts', icon: '👥' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
              </div>
              <span className="font-semibold text-brand-500">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
