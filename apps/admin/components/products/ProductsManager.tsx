'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import type { Product } from '@nodo/types'
import { AdminLayout } from '../layout/AdminLayout'
import { Button, Badge } from '@nodo/ui'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface ProductsManagerProps {
  branchId: string
  locale: string
}

export function ProductsManager({ branchId, locale }: ProductsManagerProps) {
  const t = useTranslations('admin')
  const tCommon = useTranslations('common')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!branchId) return
    fetch(`${API}/api/admin/products?branchId=${branchId}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [branchId])

  async function toggleAvailability(product: Product) {
    await fetch(`${API}/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !product.isAvailable }),
    })
    setProducts((prev) =>
      prev.map((p) => p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p)
    )
  }

  return (
    <AdminLayout locale={locale} branchId={branchId}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('products')}</h1>
          <Button size="sm">{t('addProduct')}</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8 text-gray-400">{tCommon('loading')}</div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr>
                  {([t('thProduct'), t('thPrice'), t('thCategory'), t('thStatus'), t('thActions')]).map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const name = locale === 'en' ? product.nameEn : product.nameEs
                  return (
                    <tr key={product.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{product.categoryId.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={product.isAvailable ? 'success' : 'default'}>
                          {product.isAvailable ? t('available') : t('unavailable')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAvailability(product)}
                          className="text-xs text-brand-500 hover:underline"
                        >
                          {product.isAvailable ? t('deactivate') : t('activate')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
