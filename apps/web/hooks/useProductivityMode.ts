import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProductivityMode = 'casual' | 'work' | 'study' | 'meeting'

interface ProductivityStore {
  mode: ProductivityMode
  setMode: (mode: ProductivityMode) => void
}

export const useProductivityMode = create<ProductivityStore>()(
  persist(
    (set) => ({
      mode: 'casual',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'nodo-productivity-mode' }
  )
)
