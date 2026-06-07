'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

type Phase = 'focus' | 'break'

const DURATIONS: Record<Phase, number> = { focus: 25 * 60, break: 5 * 60 }

interface PomodoroTimerProps {
  compact?: boolean
}

export function PomodoroTimer({ compact = false }: PomodoroTimerProps) {
  const t = useTranslations('productivity')
  const [phase, setPhase] = useState<Phase>('focus')
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            const next: Phase = phase === 'focus' ? 'break' : 'focus'
            setPhase(next)
            setTimeLeft(DURATIONS[next])
            return DURATIONS[next]
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  function reset() {
    setRunning(false)
    setPhase('focus')
    setTimeLeft(DURATIONS.focus)
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const total = DURATIONS[phase]
  const progress = (timeLeft / total) * 100
  const circumference = 2 * Math.PI * 40

  if (compact) {
    return (
      <button
        onClick={() => setRunning((r) => !r)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700"
      >
        <span className="text-xs text-purple-700 dark:text-purple-300 font-mono font-bold">{mins}:{secs}</span>
        <span className="text-xs text-purple-600 dark:text-purple-400">{running ? '⏸' : '▶'}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {phase === 'focus' ? t('focus') : t('shortBreak')}
      </p>

      {/* SVG ring */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor"
            strokeWidth="6" className="text-gray-100 dark:text-gray-800" />
          <motion.circle
            cx="50" cy="50" r="40" fill="none"
            stroke={phase === 'focus' ? '#7c3aed' : '#10b981'}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold font-mono text-gray-900 dark:text-gray-100">
            {mins}:{secs}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-5 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold active:scale-95 transition-transform"
        >
          {running ? t('pause') : t('start')}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-semibold active:scale-95 transition-transform"
        >
          {t('reset')}
        </button>
      </div>
    </div>
  )
}
