'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@nodo/ui'
import type { User } from '@nodo/types'

interface AuthModalProps {
  locale: string
  tableToken: string
}

type Step = 'email' | 'sent' | 'done'

export function AuthModal({ locale, tableToken }: AuthModalProps) {
  const t = useTranslations('auth')
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSendLink() {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.post<{ message: string; devToken?: string }>(
        '/api/auth/magic-link',
        { email, locale }
      )
      setStep('sent')
      // Dev-only: auto-verify if token is returned
      if (res.devToken) {
        await handleVerify(res.devToken)
      }
    } catch {
      setError('Error al enviar el enlace. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(token: string) {
    try {
      const res = await api.get<{ accessToken: string; user: User }>(`/api/auth/verify?token=${token}`)
      login(res.accessToken, res.user)
      setStep('done')
      setTimeout(() => router.push(`/${locale}/m/${tableToken}`), 1200)
    } catch {
      setError('Enlace inválido o expirado.')
    }
  }

  function handleGuest() {
    router.push(`/${locale}/m/${tableToken}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface dark:bg-surface-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <p className="font-display text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          NODO
        </p>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-8">
          {t('optional')}
        </p>

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Benefits */}
              <div className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 mb-6 text-sm text-brand-700 dark:text-brand-300">
                {t('whySignIn')}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('emailLabel')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
                    placeholder={t('emailPlaceholder')}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button size="lg" className="w-full" loading={loading} onClick={handleSendLink}>
                  {t('sendMagicLink')}
                </Button>

                <button
                  onClick={handleGuest}
                  className="w-full text-sm text-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-2"
                >
                  {t('continueAsGuest')} →
                </button>
              </div>
            </motion.div>
          )}

          {step === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-5xl mb-4">📬</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('checkEmail')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('checkEmailDesc', { email })}
              </p>
              <button
                onClick={handleGuest}
                className="mt-6 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {t('continueAsGuest')} →
              </button>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-5xl mb-3">✅</p>
              <p className="font-bold text-gray-900 dark:text-gray-100">¡Sesión iniciada!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
