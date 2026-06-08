'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { KitchenDisplay } from './KitchenDisplay'

const STORAGE_BRANCH = 'nodo-kitchen-branch'
const STORAGE_TOKEN  = 'nodo-kitchen-token'

interface KitchenGateProps {
  initialBranchId: string
  locale: string
}

export function KitchenGate({ initialBranchId, locale }: KitchenGateProps) {
  const t = useTranslations('kitchen')
  const [branchId, setBranchId] = useState('')
  const [token, setToken] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const savedBranch = localStorage.getItem(STORAGE_BRANCH) ?? initialBranchId
    const savedToken  = localStorage.getItem(STORAGE_TOKEN) ?? ''
    if (savedBranch && savedToken) {
      setBranchId(savedBranch)
      setToken(savedToken)
      setReady(true)
    } else if (savedBranch) {
      setBranchId(savedBranch)
    }
  }, [initialBranchId])

  function handleSetup() {
    if (!branchId || !token) return
    localStorage.setItem(STORAGE_BRANCH, branchId)
    localStorage.setItem(STORAGE_TOKEN, token)
    setReady(true)
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_BRANCH)
    localStorage.removeItem(STORAGE_TOKEN)
    setReady(false)
    setToken('')
  }

  if (ready) {
    return <KitchenDisplay branchId={branchId} locale={locale} onReset={handleReset} />
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <p className="font-display text-3xl font-bold text-white">NODO</p>
          <p className="text-gray-400 mt-1 text-sm">{t('setupTitle')}</p>
        </div>

        <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">{t('branchIdLabel')}</label>
            <input
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              placeholder={t('branchIdPlaceholder')}
              className="w-full rounded-xl bg-gray-800 border border-gray-700 text-sm px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 block mb-1.5">{t('tokenLabel')}</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSetup()}
              placeholder={t('tokenPlaceholder')}
              className="w-full rounded-xl bg-gray-800 border border-gray-700 text-sm px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={handleSetup}
            disabled={!branchId || !token}
            className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            {t('startDisplay')}
          </button>
        </div>
      </div>
    </div>
  )
}
