export const locales = ['es', 'en'] as const
export type SupportedLocale = (typeof locales)[number]
export const defaultLocale: SupportedLocale = 'es'

export function isValidLocale(locale: string): locale is SupportedLocale {
  return locales.includes(locale as SupportedLocale)
}
