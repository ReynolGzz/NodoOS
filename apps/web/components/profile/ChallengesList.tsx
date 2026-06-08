'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { ChallengeDto, CafeEvent } from '@nodo/types'

interface ChallengesListProps {
  challenges: ChallengeDto[]
  events: CafeEvent[]
  locale: string
  accessToken: string
  branchId: string
  onEventAttend: () => void
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function ChallengesList({ challenges, events, locale, accessToken, branchId, onEventAttend }: ChallengesListProps) {
  const t = useTranslations('gamification')

  async function attendEvent(eventId: string) {
    await fetch(`${API}/api/gamification/events/${eventId}/attend`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    onEventAttend()
  }

  const active = challenges.filter((c) => !c.completedAt)
  const completed = challenges.filter((c) => c.completedAt)
  const upcomingEvents = events.filter((e) => new Date(e.startsAt) > new Date())

  return (
    <div className="p-4 space-y-6">
      {/* Active challenges */}
      {active.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('challenges')}
          </p>
          {active.map((challenge, i) => {
            const pct = Math.min(100, Math.round((challenge.progress / challenge.targetValue) * 100))
            const name = locale === 'en' ? challenge.nameEn : challenge.nameEs
            const desc = locale === 'en' ? challenge.descriptionEn : challenge.descriptionEs
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
                    {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
                  </div>
                  <span className="text-xs font-bold text-brand-500 ml-2">+{challenge.xpReward} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 + i * 0.05 }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {t('progress_label', { current: challenge.progress, target: challenge.targetValue })}
                  </span>
                </div>
                {challenge.expiresAt && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Expira {new Date(challenge.expiresAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Completed challenges */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-green-500 uppercase tracking-wide">{t('completed')}</p>
          {completed.map((challenge) => (
            <div key={challenge.id} className="flex items-center justify-between py-2 px-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                {locale === 'en' ? challenge.nameEn : challenge.nameEs}
              </p>
              <span className="text-xs text-green-500">+{challenge.xpReward} XP</span>
            </div>
          ))}
        </div>
      )}

      {/* Events */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {t('events')}
          </p>
          {upcomingEvents.map((event) => {
            const name = locale === 'en' ? event.nameEn : event.nameEs
            const desc = locale === 'en' ? event.descriptionEn : event.descriptionEs
            const start = new Date(event.startsAt)
            return (
              <div key={event.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
                    {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
                    <p className="text-xs text-brand-500 mt-1">
                      {start.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {' · '}{start.toLocaleTimeString(locale === 'en' ? 'en-US' : 'es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => attendEvent(event.id)}
                    className="ml-3 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
                  >
                    {t('attend', { xp: event.xpReward })}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {active.length === 0 && upcomingEvents.length === 0 && completed.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-sm">{t('noEvents')}</p>
        </div>
      )}
    </div>
  )
}
