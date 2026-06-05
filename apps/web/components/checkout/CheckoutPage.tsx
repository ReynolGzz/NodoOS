'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { api } from '@/lib/api'
import { PaymentMethod } from '@nodo/types'
import type { CreateOrderDto, PaymentIntentResponse } from '@nodo/types'
import { Button } from '@nodo/ui'
import { StripeCheckout } from './StripeCheckout'
import { OrderSummary } from './OrderSummary'

interface CheckoutPageProps {
  tableToken: string
  locale: string
}

const PAYMENT_METHODS = [
  { id: PaymentMethod.STRIPE,       labelKey: 'card',        icon: '💳' },
  { id: PaymentMethod.MERCADOPAGO,  labelKey: 'mercadopago', icon: '🟦' },
  { id: PaymentMethod.APPLE_PAY,    labelKey: 'applePay',    icon: '🍎' },
  { id: PaymentMethod.GOOGLE_PAY,   labelKey: 'googlePay',   icon: '🟢' },
]

export function CheckoutPage({ tableToken, locale }: CheckoutPageProps) {
  const t = useTranslations('checkout')
  const tErrors = useTranslations('errors')
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.STRIPE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  if (items.length === 0) {
    router.replace(`/${locale}/m/${tableToken}`)
    return null
  }

  async function handlePlaceOrder() {
    setLoading(true)
    setError(null)
    try {
      const orderDto: CreateOrderDto = {
        tableToken,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          notes: i.notes,
          customizations: i.customizations.map((c) => ({
            optionId: c.optionId,
            valueId: c.valueId,
          })),
        })),
        paymentMethod: method,
      }

      const order = await api.post<{ id: string }>('/api/orders', orderDto)
      setOrderId(order.id)

      const intentRes = await api.post<PaymentIntentResponse>('/api/payments/intent', {
        orderId: order.id,
        paymentMethod: method,
      })

      if (method === PaymentMethod.MERCADOPAGO && intentRes.initPoint) {
        // Redirect to MercadoPago
        window.location.href = intentRes.initPoint
        return
      }

      if (intentRes.clientSecret) {
        setClientSecret(intentRes.clientSecret)
      }
    } catch {
      setError(tErrors('paymentFailed'))
    } finally {
      setLoading(false)
    }
  }

  function handlePaymentSuccess() {
    clearCart()
    router.push(`/${locale}/m/${tableToken}/order/${orderId}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-surface-dark">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ←
        </button>
        <h1 className="font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Order summary */}
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {t('orderSummary')}
          </h2>
          <OrderSummary items={items} locale={locale} />
        </div>

        {/* Total */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="font-semibold text-gray-700 dark:text-gray-300">{t('orderSummary')}</span>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">${total().toFixed(2)}</span>
        </div>

        {/* Stripe inline form */}
        {clientSecret && orderId ? (
          <div className="p-4">
            <StripeCheckout
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              locale={locale}
            />
          </div>
        ) : (
          <>
            {/* Payment method selector */}
            <div className="p-4">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {t('paymentMethod')}
              </h2>
              <div className="flex flex-col gap-2">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setMethod(pm.id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      method === pm.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{pm.icon}</span>
                    <span className={`font-medium text-sm ${method === pm.id ? 'text-brand-700 dark:text-brand-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      {t(pm.labelKey as any)}
                    </span>
                    {method === pm.id && (
                      <span className="ml-auto text-brand-500">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mx-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom CTA */}
      {!clientSecret && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 safe-bottom">
          <Button size="lg" className="w-full" loading={loading} onClick={handlePlaceOrder}>
            {t('placeOrder')} · ${total().toFixed(2)}
          </Button>
          <p className="text-xs text-center text-gray-400 mt-2">{t('securePayment')}</p>
        </div>
      )}
    </div>
  )
}
