'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'

interface CartBarProps {
  tableToken: string
  locale: string
}

export function CartBar({ tableToken, locale }: CartBarProps) {
  const t = useTranslations('cart')
  const router = useRouter()
  const count = useCart((s) => s.itemCount())
  const total = useCart((s) => s.total())

  if (count === 0) return null

  function handleCheckout() {
    router.push(`/${locale}/m/${tableToken}/checkout`)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4 safe-bottom"
      >
        <button
          onClick={handleCheckout}
          className="w-full flex items-center justify-between bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-2xl px-5 py-4 shadow-brand transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="bg-white/20 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {count}
            </span>
            <span className="font-medium">{t('checkout')}</span>
          </span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
