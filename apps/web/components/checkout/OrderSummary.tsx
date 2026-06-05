import type { CartItem } from '@nodo/types'

interface OrderSummaryProps {
  items: CartItem[]
  locale: string
}

export function OrderSummary({ items, locale }: OrderSummaryProps) {
  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-surface-dark-card rounded-2xl p-4">
      {items.map((item) => {
        const name = locale === 'en' ? item.product.nameEn : item.product.nameEs
        return (
          <div key={item.id} className="flex items-start gap-3">
            <span className="text-sm font-bold text-brand-500 w-5 flex-shrink-0">{item.quantity}×</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{name}</p>
              {item.customizations.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.customizations.map((c) => c.valueName).join(', ')}
                </p>
              )}
              {item.notes && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">📝 {item.notes}</p>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">
              ${(item.unitPrice * item.quantity).toFixed(2)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
