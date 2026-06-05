'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import type { Table } from '@nodo/types'
import { AdminLayout } from '../layout/AdminLayout'
import { Button, Badge } from '@nodo/ui'
import QRCode from 'qrcode'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

interface TablesManagerProps {
  branchId: string
  locale: string
}

export function TablesManager({ branchId, locale }: TablesManagerProps) {
  const t = useTranslations('admin')
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [qrModal, setQrModal] = useState<{ table: Table; dataUrl: string } | null>(null)

  useEffect(() => {
    if (!branchId) return
    fetch(`${API}/api/admin/tables?branchId=${branchId}`)
      .then((r) => r.json())
      .then(setTables)
      .finally(() => setLoading(false))
  }, [branchId])

  async function handleAddTable() {
    const number = tables.length + 1
    const res = await fetch(`${API}/api/admin/tables?branchId=${branchId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number }),
    })
    const newTable = await res.json()
    setTables((prev) => [...prev, newTable])
  }

  async function showQR(table: Table) {
    const url = `${APP_URL}/${locale}/m/${table.qrToken}`
    const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#000', light: '#fff' } })
    setQrModal({ table, dataUrl })
  }

  return (
    <AdminLayout locale={locale} branchId={branchId}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('tables')}</h1>
          <Button size="sm" onClick={handleAddTable}>{t('addTable')}</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8 text-gray-400">Cargando...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {tables.map((table) => (
              <div
                key={table.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center"
              >
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{table.number}</p>
                <p className="text-xs text-gray-400 mb-3 font-mono truncate">{table.qrToken}</p>
                <button
                  onClick={() => showQR(table)}
                  className="text-xs text-brand-500 hover:underline flex items-center justify-center gap-1 w-full"
                >
                  <span>⬛</span> {t('qrCode')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setQrModal(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
              {t('tableNumber', { number: qrModal.table.number })}
            </p>
            <p className="text-xs text-gray-400 mb-4 font-mono">{qrModal.table.qrToken}</p>
            <img src={qrModal.dataUrl} alt="QR" className="mx-auto rounded-xl" />
            <p className="text-xs text-gray-400 mt-3">
              {APP_URL}/{locale}/m/{qrModal.table.qrToken}
            </p>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="secondary" className="flex-1" onClick={() => setQrModal(null)}>
                Cerrar
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  const a = document.createElement('a')
                  a.href = qrModal.dataUrl
                  a.download = `mesa-${qrModal.table.number}-qr.png`
                  a.click()
                }}
              >
                Descargar
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
