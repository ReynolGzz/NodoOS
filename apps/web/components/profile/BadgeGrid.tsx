'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { BadgeDto } from '@nodo/types'

interface BadgeGridProps {
  badges: BadgeDto[]
  locale: string
}

export function BadgeGrid({ badges, locale }: BadgeGridProps) {
  const t = useTranslations('gamification')

  const earned = badges.filter((b) => b.earned)
  const locked = badges.filter((b) => !b.earned)

  return (
    <div className="p-4 space-y-4">
      {earned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {t('badgesEarned', { count: earned.length })}
          </p>
          <div className="grid grid-cols-4 gap-3">
            {earned.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col items-center gap-1"
                title={locale === 'en' ? badge.nameEn : badge.nameEs}
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border-2 border-brand-200 dark:border-brand-700 flex items-center justify-center text-2xl shadow-soft">
                  {badge.icon}
                </div>
                <p className="text-[9px] text-center text-gray-600 dark:text-gray-400 leading-tight line-clamp-2">
                  {locale === 'en' ? badge.nameEn : badge.nameEs}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{t('locked')}</p>
          <div className="grid grid-cols-4 gap-3">
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center gap-1 opacity-40"
                title={locale === 'en' ? badge.nameEn : badge.nameEs}
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-2xl grayscale">
                  {badge.icon}
                </div>
                <p className="text-[9px] text-center text-gray-400 leading-tight line-clamp-2">
                  {locale === 'en' ? badge.nameEn : badge.nameEs}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
