import { createI18n } from 'vue-i18n'

// Import translation files
import en from './locales/en.json'
import sk from './locales/sk.json'
import cs from './locales/cs.json'
import pl from './locales/pl.json'
import de from './locales/de.json'
import es from './locales/es.json'

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'sk', 'cs', 'pl', 'de', 'es']

// Default locale
const DEFAULT_LOCALE = 'en'

// Function to detect browser language
function getBrowserLocale(): string {
  const browserLocale = navigator.language || (navigator as any).userLanguage
  const shortLocale = browserLocale.split('-')[0]
  
  // Check if the detected locale is supported
  if (SUPPORTED_LOCALES.includes(shortLocale)) {
    return shortLocale
  }
  
  return DEFAULT_LOCALE
}

// Function to get locale from localStorage or browser
function getStoredOrBrowserLocale(): string {
  try {
    const storedLocale = localStorage.getItem('locale')
    if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale)) {
      return storedLocale
    }
  } catch (error) {
    console.warn('Failed to access localStorage:', error)
  }
  
  return getBrowserLocale()
}

// Get the initial locale
const initialLocale = getStoredOrBrowserLocale()

// Create i18n instance
export const i18n = createI18n({
  locale: initialLocale,
  fallbackLocale: DEFAULT_LOCALE,
  legacy: false, // Use Composition API mode
  globalInjection: true,
  messages: {
    en,
    sk,
    cs,
    pl,
    de,
    es
  }
})

// Function to set locale and save to localStorage
export function setLocale(locale: string): void {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`)
    return
  }
  
  i18n.global.locale.value = locale as any
  
  try {
    localStorage.setItem('locale', locale)
  } catch (error) {
    console.warn('Failed to save locale to localStorage:', error)
  }
  
  // Update document language attribute
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale
  }
}

// Function to get current locale
export function getCurrentLocale(): string {
  return i18n.global.locale.value
}

// Language names for display
export const LOCALE_NAMES = {
  en: 'English',
  sk: 'Slovenčina',
  cs: 'Čeština',
  pl: 'Polski',
  de: 'Deutsch',
  es: 'Español'
} as const

export default i18n