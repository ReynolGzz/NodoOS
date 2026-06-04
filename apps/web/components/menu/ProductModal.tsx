'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import type { Product, ProductOption, CartItemCustomization } from '@nodo/types'
import { ProductOptionType } from '@nodo/types'
import { useCart } from '@/hooks/useCart'
import { Button, cn } from '@nodo/ui'

interface ProductModalProps {
  product: Product
  locale: string
  onClose: () => void
}

export function ProductModal({ product, locale, onClose }: ProductModalProps) {
  const t = useTranslations('menu')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const name = locale === 'en' ? product.nameEn : product.nameEs
  const description = locale === 'en' ? product.descriptionEn : product.descriptionEs

  useEffect(() => {
    // Lock scroll while open
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function getOptionName(opt: ProductOption) {
    return locale === 'en' ? opt.nameEn : opt.nameEs
  }

  function toggleOption(optionId: string, valueId: string, type: ProductOptionType) {
    setSelected((prev) => {
      if (type === ProductOptionType.SINGLE) {
        return { ...prev, [optionId]: [valueId] }
      }
      const current = prev[optionId] ?? []
      const exists = current.includes(valueId)
      return {
        ...prev,
        [optionId]: exists ? current.filter((id) => id !== valueId) : [...current, valueId],
      }
    })
  }

  function isValid() {
    return product.options.every((opt) => {
      if (!opt.isRequired) return true
      return (selected[opt.id]?.length ?? 0) > 0
    })
  }

  function buildCustomizations(): CartItemCustomization[] {
    const result: CartItemCustomization[] = []
    for (const opt of product.options) {
      const selectedValueIds = selected[opt.id] ?? []
      for (const valueId of selectedValueIds) {
        const value = opt.values.find((v) => v.id === valueId)
        if (!value) continue
        result.push({
          optionId: opt.id,
          valueId,
          optionName: locale === 'en' ? opt.nameEn : opt.nameEs,
          valueName: locale === 'en' ? value.nameEn : value.nameEs,
          priceDelta: value.priceDelta,
        })
      }
    }
    return result
  }

  function handleAdd() {
    if (!isValid()) return
    addItem(product, quantity, buildCustomizations(), notes || undefined)
    setAdded(true)
    setTimeout(onClose, 600)
  }

  const extrasCost = buildCustomizations().reduce((s, c) => s + c.priceDelta, 0)
  const lineTotal = (product.price + extrasCost) * quantity

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-dark-card rounded-t-3xl safe-bottom max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Product image */}
        {product.imageUrl && (
          <div className="relative w-full h-52">
            <Image src={product.imageUrl} alt={name} fill className="object-cover" />
          </div>
        )}

        <div className="p-5 flex flex-col gap-5">
          {/* Header */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{name}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
            <p className="mt-2 text-lg font-bold text-brand-500">${product.price.toFixed(2)}</p>
          </div>

          {/* Options */}
          {product.options.map((opt) => {
            const optName = getOptionName(opt)
            const selectedIds = selected[opt.id] ?? []

            return (
              <div key={opt.id}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{optName}</h3>
                  {opt.isRequired && (
                    <span className="text-xs text-brand-500 font-medium">{t('required')}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => {
                    const isSelected = selectedIds.includes(val.id)
                    const valName = locale === 'en' ? val.nameEn : val.nameEs
                    return (
                      <button
                        key={val.id}
                        onClick={() => toggleOption(opt.id, val.id, opt.type)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-sm border transition-all duration-150',
                          isSelected
                            ? 'bg-brand-500 text-white border-brand-500'
                            : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-400'
                        )}
                      >
                        {valName}
                        {val.priceDelta !== 0 && (
                          <span className="ml-1 opacity-75">
                            {val.priceDelta > 0 ? '+' : ''}${val.priceDelta.toFixed(0)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
              {t('notes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Quantity + Add */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 transition-colors"
              >
                +
              </button>
            </div>

            <Button
              size="lg"
              onClick={handleAdd}
              disabled={!isValid()}
              className="flex-1"
            >
              {added ? t('added') : `${t('addToCart')} · $${lineTotal.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
