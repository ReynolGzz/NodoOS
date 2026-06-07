'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { BillSplit } from '@nodo/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface BillSplitterProps {
  orderId: string
  total: number
  locale: string
}

export function BillSplitter({ orderId, total, locale }: BillSplitterProps) {
  const t = useTranslations('productivity')
  const [partySize, setPartySize] = useState(2)
  const [split, setSplit] = useState<BillSplit | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function calculate() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/productivity/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, partySize }),
      })
      const data: BillSplit = await res.json()
      setSplit(data)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full py-3 px-4 rounded-2xl border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm font-semibold active:scale-95 transition-transform"
      >
        <span>🤝</span>
        {t('splitBill')}
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-2xl border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10 overflow-hidden"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>🤝</span> {t('splitBill')}
          </p>
          <button onClick={() => setOpen(false)} className="text-gray-400 text-sm">✕</button>
        </div>

        {/* Party size selector */}
        <div>
          <p className="text-xs text-gray-500 mb-2">{t('splitBy')}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPartySize((p) => Math.max(2, p - 1))}
              className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-lg active:scale-95 transition-transform"
            >
              −
            </button>
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 w-8 text-center">{partySize}</span>
            <button
              onClick={() => setPartySize((p) => Math.min(20, p + 1))}
              className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-lg active:scale-95 transition-transform"
            >
              +
            </button>
            <span className="text-sm text-gray-500 ml-1">{t('people')}</span>
          </div>
        </div>

        {/* Quick preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            ${(total / partySize).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">{t('perPerson')}</p>
        </div>

        <button
          onClick={calculate}
          disabled={loading}
          className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform disabled:opacity-60"
        >
          {loading ? '...' : t('splitBill')}
        </button>

        {/* Detailed split */}
        {split && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Desglose</p>
            {split.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{item.name}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium ml-2">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-orange-200 dark:border-orange-700 pt-2 flex justify-between font-bold">
              <span className="text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-brand-600 dark:text-brand-400">${split.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-orange-600 dark:text-orange-400">
              <span>{t('perPerson')}</span>
              <span>${split.perPerson.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
