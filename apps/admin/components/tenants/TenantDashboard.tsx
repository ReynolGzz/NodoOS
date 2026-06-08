'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { AdminLayout } from '../layout/AdminLayout'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface BranchStat {
  branch: { id: string; name: string; slug: string }
  todayOrders: number
  todayRevenue: number
  activeOrders: number
  staffCount: number
}

interface Overview {
  tenant: { id: string; name: string; slug: string; plan: string; branding: Record<string, string> }
  summary: { totalRevenue: number; totalOrders: number; totalBranches: number }
  branches: BranchStat[]
}

interface Role { id: string; name: string }

interface StaffMember {
  id: string
  branchId: string | null
  user: { id: string; name: string | null; email: string }
  role: { id: string; name: string }
  createdAt: string
}

interface TenantDashboardProps {
  tenantId: string
  branchId: string
  locale: string
}

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-amber-100 text-amber-700',
  pro: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
}

export function TenantDashboard({ tenantId, branchId, locale }: TenantDashboardProps) {
  const t = useTranslations('admin')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [tab, setTab] = useState<'overview' | 'staff' | 'branding'>('overview')
  const [newStaff, setNewStaff] = useState({ email: '', roleId: '', branchId: '' })
  const [brandForm, setBrandForm] = useState({ primaryColor: '', accentColor: '', logoUrl: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!tenantId) return
    const [ov, sf, rl] = await Promise.all([
      fetch(`${API}/api/tenants/${tenantId}/overview`).then((r) => r.json()),
      fetch(`${API}/api/tenants/${tenantId}/staff`).then((r) => r.json()),
      fetch(`${API}/api/tenants/${tenantId}/roles`).then((r) => r.json()),
    ])
    setOverview(ov)
    setStaff(Array.isArray(sf) ? sf : [])
    setRoles(Array.isArray(rl) ? rl : [])
    if (ov?.tenant?.branding) {
      setBrandForm({
        primaryColor: ov.tenant.branding.primaryColor ?? '#c8973a',
        accentColor: ov.tenant.branding.accentColor ?? '#e8b355',
        logoUrl: ov.tenant.branding.logoUrl ?? '',
      })
    }
  }, [tenantId])

  useEffect(() => { load() }, [load])

  async function addStaff() {
    if (!newStaff.email || !newStaff.roleId) return
    await fetch(`${API}/api/tenants/${tenantId}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newStaff.email, roleId: newStaff.roleId, branchId: newStaff.branchId || undefined }),
    })
    setNewStaff({ email: '', roleId: '', branchId: '' })
    load()
  }

  async function removeStaff(staffId: string) {
    await fetch(`${API}/api/tenants/${tenantId}/staff/${staffId}`, { method: 'DELETE' })
    setStaff((prev) => prev.filter((s) => s.id !== staffId))
  }

  async function saveBranding() {
    setSaving(true)
    await fetch(`${API}/api/tenants/${tenantId}/branding`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primaryColor: brandForm.primaryColor,
        accentColor: brandForm.accentColor,
        logoUrl: brandForm.logoUrl || null,
      }),
    })
    setSaving(false)
    load()
  }

  const TABS = [
    { key: 'overview', label: t('overview') },
    { key: 'staff', label: t('staff') },
    { key: 'branding', label: t('branding') },
  ] as const

  return (
    <AdminLayout locale={locale} branchId={branchId}>
      <div className="p-6 space-y-6">
        {/* Header */}
        {overview && (
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{overview.tenant.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">nodo.cafe/{overview.tenant.slug}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${PLAN_COLORS[overview.tenant.plan] ?? 'bg-gray-100'}`}>
              {overview.tenant.plan}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && overview && (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t('totalBranches'), value: overview.summary.totalBranches, icon: '🏪' },
                { label: t('todayOrders'), value: overview.summary.totalOrders, icon: '📋' },
                { label: t('todayRevenue'), value: `$${overview.summary.totalRevenue.toFixed(0)}`, icon: '💰' },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                  <p className="text-xl mb-1">{s.icon}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Per-branch breakdown */}
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('branches')}</h2>
              {overview.branches.map((b) => (
                <div key={b.branch.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{b.branch.name}</p>
                    {b.activeOrders > 0 && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        {b.activeOrders} {t('active')}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{b.todayOrders}</p>
                      <p className="text-xs text-gray-500">{t('orders')}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-brand-600 dark:text-brand-400">${b.todayRevenue.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">{t('revenue')}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{b.staffCount}</p>
                      <p className="text-xs text-gray-500">{t('staff')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff tab */}
        {tab === 'staff' && (
          <div className="space-y-4">
            {/* Add staff form */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('addStaff')}</h2>
              <input
                value={newStaff.email}
                onChange={(e) => setNewStaff((p) => ({ ...p, email: e.target.value }))}
                placeholder={t('staffEmail')}
                type="email"
                className="w-full input-base"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newStaff.roleId}
                  onChange={(e) => setNewStaff((p) => ({ ...p, roleId: e.target.value }))}
                  className="input-base"
                >
                  <option value="">{t('selectRole')}</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <input
                  value={newStaff.branchId}
                  onChange={(e) => setNewStaff((p) => ({ ...p, branchId: e.target.value }))}
                  placeholder={t('branchOptional')}
                  className="input-base"
                />
              </div>
              <button
                onClick={addStaff}
                disabled={!newStaff.email || !newStaff.roleId}
                className="w-full py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {t('addStaff')}
              </button>
            </div>

            {/* Staff list */}
            <div className="space-y-2">
              {staff.map((s) => (
                <div key={s.id} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{s.user.name ?? s.user.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{s.role.name}</span>
                      {s.branchId && <span className="text-xs text-gray-400">• 1 sucursal</span>}
                      {!s.branchId && <span className="text-xs text-gray-400">• todas las sucursales</span>}
                    </div>
                  </div>
                  <button onClick={() => removeStaff(s.id)} className="text-red-400 hover:text-red-600 text-sm px-2">✕</button>
                </div>
              ))}
              {staff.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">{t('noStaff')}</p>
              )}
            </div>
          </div>
        )}

        {/* Branding tab */}
        {tab === 'branding' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('brandingConfig')}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('primaryColor')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandForm.primaryColor}
                    onChange={(e) => setBrandForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="h-10 w-14 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                  />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{brandForm.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">{t('accentColor')}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandForm.accentColor}
                    onChange={(e) => setBrandForm((p) => ({ ...p, accentColor: e.target.value }))}
                    className="h-10 w-14 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                  />
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{brandForm.accentColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">{t('logoUrl')}</label>
              <input
                value={brandForm.logoUrl}
                onChange={(e) => setBrandForm((p) => ({ ...p, logoUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full input-base"
              />
            </div>

            {/* Preview */}
            <div
              className="rounded-2xl p-4 text-white text-center"
              style={{ background: `linear-gradient(135deg, ${brandForm.primaryColor}, ${brandForm.accentColor})` }}
            >
              {brandForm.logoUrl
                ? <img src={brandForm.logoUrl} alt="Logo" className="h-8 mx-auto mb-2 object-contain" />
                : <p className="font-display font-bold text-xl">{overview?.tenant.name ?? 'NODO'}</p>
              }
              <p className="text-xs opacity-80 mt-1">{t('brandPreview')}</p>
            </div>

            <button
              onClick={saveBranding}
              disabled={saving}
              className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm disabled:opacity-60"
            >
              {saving ? '...' : t('saveBranding')}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
