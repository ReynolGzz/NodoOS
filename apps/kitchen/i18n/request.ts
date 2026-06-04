import { getRequestConfig } from 'next-intl/server'
import { defaultLocale, isValidLocale } from '@nodo/i18n'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !isValidLocale(locale)) locale = defaultLocale
  return {
    locale,
    messages: (await import(`../../../packages/i18n/locales/${locale}.json`)).default,
  }
})
