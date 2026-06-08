'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { AdminLayout } from '../layout/AdminLayout'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Campaign {
  id: string
  name: string
  channel: string
  trigger: string
  sentCount: number
  isActive: boolean
  lastRunAt: string | null
  messageTemplate: { es: string; en: string }
  createdAt: string
}

interface Segment { id: string; name: string; userCount: number }

interface CampaignsViewProps {
  branchId: string
  locale: string
  token?: string
}

const CHANNEL_ICONS: Record<string, string> = { push: '🔔', whatsapp: '💬', email: '📧' }
const TRIGGER_COLORS: Record<string, string> = {
  manual: 'bg-blue-100 text-blue-700',
  inactivity: 'bg-orange-100 text-orange-700',
  birthday: 'bg-pink-100 text-pink-700',
  milestone: 'bg-purple-100 text-purple-700',
}

export function CampaignsView({ branchId, locale, token }: CampaignsViewProps) {
  const t = useTranslations('admin')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    channel: 'push',
    trigger: 'manual',
    segmentId: '',
    messageEs: '',
    messageEn: '',
  })

  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const load = useCallback(async () => {
    if (!branchId) return
    const [c, s] = await Promise.all([
      fetch(`${API}/api/analytics/campaigns?branchId=${branchId}`, { headers }).then((r) => r.json()),
      fetch(`${API}/api/analytics/segments?branchId=${branchId}`, { headers }).then((r) => r.json()),
    ])
    setCampaigns(Array.isArray(c) ? c : [])
    setSegments(Array.isArray(s) ? s : [])
  }, [branchId])

  useEffect(() => { load() }, [load])

  async function createCampaign() {
    if (!form.name || !form.messageEs) return
    await fetch(`${API}/api/analytics/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        branchId,
        name: form.name,
        channel: form.channel,
        trigger: form.trigger,
        segmentId: form.segmentId || undefined,
        messageTemplate: { es: form.messageEs, en: form.messageEn || form.messageEs },
      }),
    })
    setForm({ name: '', channel: 'push', trigger: 'manual', segmentId: '', messageEs: '', messageEn: '' })
    setShowForm(false)
    load()
  }

  async function sendCampaign(id: string) {
    setSending(id)
    try {
      const res = await fetch(`${API}/api/analytics/campaigns/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ locale }),
      })
      const data = await res.json()
      alert(`${t('campaignSent')}: ${data.sentCount} ${t('recipients')}`)
      load()
    } finally {
      setSending(null)
    }
  }

  async function deleteCampaign(id: string) {
    await fetch(`${API}/api/analytics/campaigns/${id}`, { method: 'DELETE', headers })
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <AdminLayout locale={locale} branchId={branchId}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('campaigns')}</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-semibold"
          >
            + {t('newCampaign')}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('newCampaign')}</h2>

            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder={t('campaignName')}
              className="w-full input-base"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('channel')}</label>
                <select
                  value={form.channel}
                  onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}
                  className="w-full input-base"
                >
                  <option value="push">🔔 Push</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="email">📧 Email</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('trigger')}</label>
                <select
                  value={form.trigger}
                  onChange={(e) => setForm((p) => ({ ...p, trigger: e.target.value }))}
                  className="w-full input-base"
                >
                  <option value="manual">{t('manual')}</option>
                  <option value="inactivity">{t('inactivity')}</option>
                  <option value="birthday">{t('birthday')}</option>
                  <option value="milestone">{t('milestone')}</option>
                </select>
              </div>
            </div>

            {segments.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('segment')} ({t('optional')})</label>
                <select
                  value={form.segmentId}
                  onChange={(e) => setForm((p) => ({ ...p, segmentId: e.target.value }))}
                  className="w-full input-base"
                >
                  <option value="">{t('allUsers')}</option>
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.userCount})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-500 block mb-1">{t('messageEs')}</label>
              <textarea
                value={form.messageEs}
                onChange={(e) => setForm((p) => ({ ...p, messageEs: e.target.value }))}
                rows={2}
                className="w-full input-base resize-none"
                placeholder="Mensaje en español..."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">{t('messageEn')}</label>
              <textarea
                value={form.messageEn}
                onChange={(e) => setForm((p) => ({ ...p, messageEn: e.target.value }))}
                rows={2}
                className="w-full input-base resize-none"
                placeholder="Message in English..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={createCampaign}
                disabled={!form.name || !form.messageEs}
                className="flex-1 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {t('createCampaign')}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Campaign list */}
        <div className="space-y-3">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">{CHANNEL_ICONS[c.channel] ?? '📢'}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TRIGGER_COLORS[c.trigger] ?? 'bg-gray-100 text-gray-600'}`}>
                        {t(c.trigger as any)}
                      </span>
                      <span className="text-xs text-gray-500">{c.sentCount} {t('sent')}</span>
                      {c.lastRunAt && (
                        <span className="text-xs text-gray-400">
                          · {new Date(c.lastRunAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{c.messageTemplate[locale as 'es' | 'en'] ?? c.messageTemplate.es}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => sendCampaign(c.id)}
                    disabled={sending === c.id}
                    className="px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-semibold disabled:opacity-60"
                  >
                    {sending === c.id ? '...' : t('send')}
                  </button>
                  <button
                    onClick={() => deleteCampaign(c.id)}
                    className="text-red-400 hover:text-red-600 text-xs px-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-3">📢</p>
              <p className="text-sm">{t('noCampaigns')}</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
