'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { AdminLayout } from '../layout/AdminLayout'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface DailyPoint { date: string; orders: number; revenue: number }
interface HourlyPoint { hour: number; orders: number; revenue: number }
interface TopProduct { productId: string; nameEs: string; nameEn: string; totalQuantity: number; totalRevenue: number }
interface ForecastPoint { hourOfDay: number; predictedOrders: number; predictedRevenue: number; confidenceScore: number }
interface CustomerStats { newUsers: number; returningUsers: number; totalUsers: number }

interface Segment {
  id: string
  name: string
  description: string
  userCount: number
  rules: Record<string, unknown>
  updatedAt: string
}

interface AnalyticsViewProps {
  branchId: string
  locale: string
  token?: string
}

function BarChart({ data, valueKey, labelKey, color = 'bg-brand-500' }: {
  data: Record<string, unknown>[]
  valueKey: string
  labelKey: string
  color?: string
}) {
  const max = Math.max(...data.map((d) => d[valueKey] as number), 1)
  return (
    <div className="flex items-end gap-0.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t ${color} transition-all`}
            style={{ height: `${Math.max(2, ((d[valueKey] as number) / max) * 88)}px` }}
          />
          {data.length <= 16 && (
            <span className="text-[8px] text-gray-400 rotate-0">
              {String(d[labelKey]).length > 3 ? String(d[labelKey]).slice(-2) : d[labelKey]}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function AnalyticsView({ branchId, locale, token }: AnalyticsViewProps) {
  const t = useTranslations('admin')
  const [daily, setDaily] = useState<DailyPoint[]>([])
  const [hourly, setHourly] = useState<HourlyPoint[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [forecast, setForecast] = useState<ForecastPoint[]>([])
  const [customers, setCustomers] = useState<CustomerStats | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [newSegment, setNewSegment] = useState({ name: '', description: '', minVisits: '', lastVisitDays: '' })
  const [loading, setLoading] = useState(true)

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined

  const load = useCallback(async () => {
    if (!branchId) return
    setLoading(true)
    try {
      const [d, h, tp, fc, cs, sg] = await Promise.all([
        fetch(`${API}/api/analytics/daily?branchId=${branchId}&days=14`, { headers }).then((r) => r.json()),
        fetch(`${API}/api/analytics/hourly?branchId=${branchId}`, { headers }).then((r) => r.json()),
        fetch(`${API}/api/analytics/top-products?branchId=${branchId}&limit=8`, { headers }).then((r) => r.json()),
        fetch(`${API}/api/analytics/forecast?branchId=${branchId}`, { headers }).then((r) => r.json()),
        fetch(`${API}/api/analytics/customers?branchId=${branchId}`, { headers }).then((r) => r.json()),
        fetch(`${API}/api/analytics/segments?branchId=${branchId}`, { headers }).then((r) => r.json()),
      ])
      setDaily(Array.isArray(d) ? d : [])
      setHourly(Array.isArray(h) ? h : [])
      setTopProducts(Array.isArray(tp) ? tp : [])
      setForecast(Array.isArray(fc) ? fc : [])
      setCustomers(cs?.totalUsers !== undefined ? cs : null)
      setSegments(Array.isArray(sg) ? sg : [])
    } finally {
      setLoading(false)
    }
  }, [branchId])

  useEffect(() => { load() }, [load])

  async function createSegment() {
    if (!newSegment.name) return
    const rules: Record<string, number> = {}
    if (newSegment.minVisits) rules.minVisits = parseInt(newSegment.minVisits)
    if (newSegment.lastVisitDays) rules.lastVisitDays = parseInt(newSegment.lastVisitDays)

    await fetch(`${API}/api/analytics/segments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
      body: JSON.stringify({ branchId, name: newSegment.name, description: newSegment.description, rules }),
    })
    setNewSegment({ name: '', description: '', minVisits: '', lastVisitDays: '' })
    load()
  }

  async function deleteSegment(id: string) {
    await fetch(`${API}/api/analytics/segments/${id}`, { method: 'DELETE', headers })
    setSegments((prev) => prev.filter((s) => s.id !== id))
  }

  const totalForecastOrders = forecast.reduce((s, f) => s + f.predictedOrders, 0)
  const totalForecastRevenue = forecast.reduce((s, f) => s + f.predictedRevenue, 0)

  return (
    <AdminLayout locale={locale} branchId={branchId}>
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('analytics')}</h1>

        {/* Customer stats */}
        {customers && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t('totalUsers'), value: customers.totalUsers, icon: '👥' },
              { label: t('newUsers'), value: customers.newUsers, icon: '✨' },
              { label: t('returningUsers'), value: customers.returningUsers, icon: '🔄' },
            ].map((c) => (
              <div key={c.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <p className="text-2xl mb-1">{c.icon}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{c.value}</p>
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Revenue trend */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('revenueTrend')} (14d)</h2>
          <BarChart data={daily as any} valueKey="revenue" labelKey="date" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{daily[0]?.date?.slice(5)}</span>
            <span>${daily.reduce((s, d) => s + d.revenue, 0).toFixed(0)} total</span>
            <span>{daily[daily.length - 1]?.date?.slice(5)}</span>
          </div>
        </div>

        {/* Hourly today */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('hourlyToday')}</h2>
          <BarChart
            data={hourly.map((h) => ({ ...h, label: `${h.hour}h` })) as any}
            valueKey="orders"
            labelKey="label"
            color="bg-blue-400"
          />
        </div>

        {/* Demand forecast */}
        {forecast.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('demandForecast')}</h2>
              <div className="text-right">
                <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{totalForecastOrders} {t('orders')}</p>
                <p className="text-xs text-gray-500">${totalForecastRevenue.toFixed(0)} {t('forecastTomorrow')}</p>
              </div>
            </div>
            <BarChart
              data={forecast.map((f) => ({ orders: f.predictedOrders, label: `${f.hourOfDay}h` })) as any}
              valueKey="orders"
              labelKey="label"
              color="bg-amber-400"
            />
            <p className="text-xs text-gray-400 mt-2 text-center">⚡ {t('forecastNote')}</p>
          </div>
        )}

        {/* Top products */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('topProducts')}</h2>
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {locale === 'en' ? p.nameEn : p.nameEs}
                  </p>
                  <div className="h-1 bg-gray-100 dark:bg-gray-800 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded"
                      style={{ width: `${(p.totalQuantity / (topProducts[0]?.totalQuantity || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{p.totalQuantity}</p>
                  <p className="text-xs text-gray-500">${p.totalRevenue.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CRM Segments */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('crmSegments')}</h2>

          {/* Create segment */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <input
              value={newSegment.name}
              onChange={(e) => setNewSegment((p) => ({ ...p, name: e.target.value }))}
              placeholder={t('segmentName')}
              className="col-span-2 input-base"
            />
            <input
              type="number"
              value={newSegment.minVisits}
              onChange={(e) => setNewSegment((p) => ({ ...p, minVisits: e.target.value }))}
              placeholder={t('minVisits')}
              className="input-base"
            />
            <input
              type="number"
              value={newSegment.lastVisitDays}
              onChange={(e) => setNewSegment((p) => ({ ...p, lastVisitDays: e.target.value }))}
              placeholder={t('inactiveDays')}
              className="input-base"
            />
            <button
              onClick={createSegment}
              disabled={!newSegment.name}
              className="col-span-2 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {t('createSegment')}
            </button>
          </div>

          <div className="space-y-2">
            {segments.map((seg) => (
              <div key={seg.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{seg.name}</p>
                  <p className="text-xs text-gray-500">{seg.userCount} {t('users')}</p>
                </div>
                <button
                  onClick={() => deleteSegment(seg.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
                >
                  {t('delete')}
                </button>
              </div>
            ))}
            {segments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">{t('noSegments')}</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
