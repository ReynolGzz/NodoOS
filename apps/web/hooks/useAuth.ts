'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@nodo/types'
import { api } from '@/lib/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (accessToken: string, user: User) => void
  logout: () => void
  refreshProfile: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,

      login: (accessToken, user) => {
        set({ accessToken, user })
      },

      logout: () => {
        set({ user: null, accessToken: null })
      },

      refreshProfile: async () => {
        const { accessToken } = get()
        if (!accessToken) return
        try {
          const user = await api.get<User>('/api/profile', {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          set({ user })
        } catch {
          set({ user: null, accessToken: null })
        }
      },
    }),
    {
      name: 'nodo-auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
    }
  )
)
