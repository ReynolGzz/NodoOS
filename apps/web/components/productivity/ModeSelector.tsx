'use client'

import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { type ProductivityMode, useProductivityMode } from '@/hooks/useProductivityMode'

interface ModeSelectorProps {
  open: boolean
  onClose: () => void
}

const MODES: { key: ProductivityMode; icon: string; color: string }[] = [
  { key: 'casual',  icon: '🛋️', color: 'bg-blue-50  dark:bg-blue-900/20  border-blue-200  dark:border-blue-700  text-blue-700  dark:text-blue-300' },
  { key: 'work',    icon: '💻', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300' },
  { key: 'study',   icon: '📚', color: 'bg-green-50  dark:bg-green-900/20  border-green-200  dark:border-green-700  text-green-700  dark:text-green-300' },
  { key: 'meeting', icon: '🤝', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300' },
]

export function ModeSelector({ open, onClose }: ModeSelectorProps) {
  const t = useTranslations('productivity')
  const { mode, setMode } = useProductivityMode()

  function select(m: ProductivityMode) {
    setMode(m)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl p-6 pb-safe-bottom"
          >
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{t('changeMode')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {t('workActive')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => select(m.key)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${m.color} ${
                    mode === m.key ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-900' : 'opacity-80'
                  }`}
                >
                  <span className="text-3xl">{m.icon}</span>
                  <span className="text-sm font-semibold">{t(m.key as any)}</span>
                  {mode === m.key && (
                    <span className="text-[10px] font-bold bg-brand-500 text-white px-2 py-0.5 rounded-full">
                      Activo
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
