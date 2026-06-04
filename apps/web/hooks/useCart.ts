'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartItemCustomization, Product } from '@nodo/types'

interface CartState {
  items: CartItem[]
  tableToken: string | null
  addItem: (product: Product, quantity: number, customizations: CartItemCustomization[], notes?: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  setTableToken: (token: string) => void
  total: () => number
  itemCount: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableToken: null,

      addItem: (product, quantity, customizations, notes) => {
        const item: CartItem = {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          product,
          quantity,
          unitPrice: product.price + customizations.reduce((s, c) => s + c.priceDelta, 0),
          notes,
          customizations,
        }
        set((s) => ({ items: [...s.items, item] }))
      },

      removeItem: (itemId) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== itemId) })),

      updateQuantity: (itemId, quantity) =>
        set((s) => ({
          items: quantity <= 0
            ? s.items.filter((i) => i.id !== itemId)
            : s.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      setTableToken: (token) => set({ tableToken: token }),

      total: () => get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),

      itemCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
    }),
    {
      name: 'nodo-cart',
      partialize: (s) => ({ items: s.items, tableToken: s.tableToken }),
    }
  )
)
