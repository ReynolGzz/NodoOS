'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { AdminLayout } from '../layout/AdminLayout'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Plan {
  id: string
  label: string
  priceMonthlyMXN: number
  maxBranches: number
  maxOrdersPerMonth: number | null
  features: string[]
}

interface BillingStatus {
  tenantId: string
  currentPlan: string
  planDetails: Plan
  stripeStatus: string | null
  stripeCustomerId: string | null
}

interface BillingViewProps {
  tenantId: string
  branchId: string
  locale: string
}

const PLAN_HIGHLIGHTS: Record<string, string> = {
  starter: 'border-gray-200 dark:border-gray-700',
  pro: 'border-brand-500 ring-2 ring-brand-500/20',
  enterprise: 'border-purple-500 ring-2 ring-purple-500/20',
}

const PLAN_BADGE: Record<string, string> = {
  starter: '',
  pro: 'Más popular',
  enterprise: 'Para equipos grandes',
}

export function BillingView({ tenantId, branchId, locale }: BillingViewProps) {
  const t = useTranslations('admin')
  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) return
    setLoading(true)
    Promise.all([
      fetch(`${API}/api/billing/plans`).then((r) => r.json()),
      fetch(`${API}/api/billing/${tenantId}/status`).then((r) => r.json()),
    ])
      .then(([p, s]) => {
        setPlans(Array.isArray(p) ? p : [])
        setStatus(s?.tenantId ? s : null)
      })
      .finally(() => setLoading(false))
  }, [tenantId])

  async function upgradePlan(planId: string) {
    setUpgrading(planId)
    try {
      const res = await fetch(`${API}/api/billing/${tenantId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, locale }),
      })
      const data = await res.json()
      if (data?.url) window.location.href = data.url
    } finally {
      setUpgrading(null)
    }
  }

  async function manageSubscription() {
    const res = await fetch(`${API}/api/billing/${tenantId}/portal`, { method: 'POST' })
    const data = await res.json()
    if (data?.url) window.location.href = data.url
  }

  if (loading) return (
    <AdminLayout locale={locale} branchId={branchId}>
      <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
    </AdminLayout>
  )

  return (
    <AdminLayout locale={locale} branchId={branchId}>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('billing')}</h1>
          {status?.stripeCustomerId && (
            <button
              onClick={manageSubscription}
              className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              {t('manageSubscription')} →
            </button>
          )}
        </div>

        {/* Current plan */}
        {status && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 mb-1">{t('currentPlan')}</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{status.planDetails.label}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                status.stripeStatus === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {status.stripeStatus === 'active' ? t('active') : status.currentPlan === 'starter' ? t('free') : status.stripeStatus ?? 'free'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="text-sm">
                <span className="text-gray-500">{t('branches')}: </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {status.planDetails.maxBranches === Infinity ? '∞' : status.planDetails.maxBranches}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">{t('monthlyOrders')}: </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {status.planDetails.maxOrdersPerMonth === null ? '∞' : status.planDetails.maxOrdersPerMonth}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Plans grid */}
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('availablePlans')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === status?.currentPlan
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-gray-900 rounded-2xl p-5 border ${PLAN_HIGHLIGHTS[plan.id] ?? 'border-gray-200 dark:border-gray-700'}`}
                >
                  {PLAN_BADGE[plan.id] && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 bg-brand-500 text-white rounded-full whitespace-nowrap">
                      {PLAN_BADGE[plan.id]}
                    </span>
                  )}

                  <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">{plan.label}</p>
                  <div className="mt-1 mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">${plan.priceMonthlyMXN}</span>
                    <span className="text-sm text-gray-500"> MXN/mes</span>
                  </div>

                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !isCurrent && upgradePlan(plan.id)}
                    disabled={isCurrent || upgrading === plan.id}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-default'
                        : 'bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60'
                    }`}
                  >
                    {isCurrent
                      ? t('currentPlan')
                      : upgrading === plan.id
                      ? '...'
                      : t('upgradeTo', { plan: plan.label })}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-brand-500 rounded-2xl p-6 text-white">
          <p className="font-bold text-xl mb-1">{t('enterpriseCta')}</p>
          <p className="text-sm opacity-80 mb-4">{t('enterpriseCtaDesc')}</p>
          <a
            href="mailto:enterprise@nodo.cafe"
            className="inline-block px-5 py-2 bg-white text-purple-700 rounded-xl text-sm font-semibold hover:bg-gray-50"
          >
            {t('contactSales')}
          </a>
        </div>
      </div>
    </AdminLayout>
  )
}
