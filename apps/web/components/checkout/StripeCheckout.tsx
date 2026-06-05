'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useTranslations } from 'next-intl'
import { Button } from '@nodo/ui'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '')

interface StripeCheckoutProps {
  clientSecret: string
  onSuccess: () => void
  locale: string
}

export function StripeCheckout({ clientSecret, onSuccess, locale }: StripeCheckoutProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: { colorPrimary: '#c8973a' },
        },
        locale: locale === 'es' ? 'es' : 'en',
      }}
    >
      <StripeForm onSuccess={onSuccess} />
    </Elements>
  )
}

function StripeForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations('checkout')
  const tErrors = useTranslations('errors')
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? tErrors('paymentFailed'))
      setLoading(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message ?? tErrors('paymentFailed'))
    } else {
      onSuccess()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <Button type="submit" size="lg" className="w-full" loading={loading || !stripe}>
        {t('placeOrder')}
      </Button>
    </form>
  )
}
