import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from '@nodo/i18n'

export const routing = defineRouting({ locales, defaultLocale, localePrefix: 'always' })
