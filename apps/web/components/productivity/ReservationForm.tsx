'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import type { ReservationDto } from '@nodo/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const DURATIONS = [
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
  { label: '4h', value: 240 },
]

interface ReservationFormProps {
  branchId: string
  locale: string
  accessToken: string
  onSuccess: (r: ReservationDto) => void
}

export function ReservationForm({ branchId, locale, accessToken, onSuccess }: ReservationFormProps) {
  const t = useTranslations('productivity')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [partySize, setPartySize] = useState(2)
  const [duration, setDuration] = useState(120)
  const [mode, setMode] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // Min date = today
  const today = new Date().toISOString().split('T')[0]

  async function submit() {
    if (!date) return
    setLoading(true)
    try {
      const reservedAt = `${date}T${time}:00`
      const res = await fetch(`${API}/api/productivity/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ branchId, reservedAt, durationMinutes: duration, partySize, mode: mode || null, notes: notes || null }),
      })
      const reservation: ReservationDto = await res.json()
      setDone(true)
      onSuccess(reservation)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8"
      >
        <p className="text-4xl mb-3">✅</p>
        <p className="font-bold text-gray-900 dark:text-gray-100">{t('reservationConfirmed')}</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Date + time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">{t('reserveDate')}</label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Hora</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Party size */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-2">{t('reservePartySize')}</label>
        <div className="flex items-center gap-3">
          <button onClick={() => setPartySize((p) => Math.max(1, p - 1))} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-lg text-gray-700 dark:text-gray-300 active:scale-95 transition-transform">−</button>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100 w-6 text-center">{partySize}</span>
          <button onClick={() => setPartySize((p) => Math.min(20, p + 1))} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-bold text-lg text-gray-700 dark:text-gray-300 active:scale-95 transition-transform">+</button>
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-2">{t('reserveDuration')}</label>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                duration === d.value
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode preference */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-2">{t('reserveMode')} <span className="text-gray-400">(opcional)</span></label>
        <div className="flex gap-2 flex-wrap">
          {['', 'work', 'study', 'meeting'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                mode === m
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
              }`}
            >
              {m === '' ? 'Sin preferencia' : t(m as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1">{t('reserveNotes')}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('reserveNotesPlaceholder')}
          rows={2}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm px-3 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <button
        onClick={submit}
        disabled={!date || loading}
        className="w-full py-3.5 bg-brand-500 text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
      >
        {loading ? '...' : t('confirmReservation')}
      </button>
    </div>
  )
}
