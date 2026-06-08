'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { storeAdminToken } from '@/hooks/useAdminAuth'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const t = useTranslations('auth')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [devToken, setDevToken] = useState('')
  const [step, setStep] = useState<'email' | 'token'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendMagicLink() {
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.devToken) setDevToken(data.devToken)
      setStep('token')
    } catch {
      setError('Error enviando el link')
    } finally {
      setLoading(false)
    }
  }

  async function verifyToken() {
    if (!devToken) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: devToken }),
      })
      const data = await res.json()
      if (data.accessToken) {
        storeAdminToken(data.accessToken)
        router.replace(`/${locale}/dashboard`)
      } else {
        setError(data.message ?? 'Token inválido')
      }
    } catch {
      setError('Error verificando el token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">NODO</p>
          <p className="text-sm text-gray-500 mt-1">Admin Dashboard</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 space-y-4">
          {step === 'email' ? (
            <>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
                  placeholder="admin@nodo.cafe"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  autoFocus
                />
              </div>
              <button
                onClick={sendMagicLink}
                disabled={!email || loading}
                className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
              >
                {loading ? '...' : t('sendMagicLink')}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('magicLinkSent')}</p>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('verificationCode')}</label>
                <input
                  type="text"
                  value={devToken}
                  onChange={(e) => setDevToken(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && verifyToken()}
                  placeholder="nodo-dev-xxxx"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  autoFocus
                />
              </div>
              <button
                onClick={verifyToken}
                disabled={!devToken || loading}
                className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
              >
                {loading ? '...' : t('verify')}
              </button>
              <button
                onClick={() => setStep('email')}
                className="w-full text-xs text-gray-400 hover:text-gray-600"
              >
                ← {t('back')}
              </button>
            </>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
