'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const TOKEN_KEY = 'nodo-admin-token'

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    setToken(stored)
    setLoading(false)
    if (!stored) {
      const locale = pathname.split('/')[1] ?? 'es'
      router.replace(`/${locale}/login`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    const locale = pathname.split('/')[1] ?? 'es'
    router.replace(`/${locale}/login`)
  }

  return { token, loading, logout }
}

export function storeAdminToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}
