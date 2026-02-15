import { useState, useEffect } from 'react'

const STORAGE_KEY = 'app-lang'
const DEFAULT = 'en'

const translations = {
  en: {
    settings: 'Settings',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    english: 'Eng',
    serbian: 'Serbian',
    close: 'Close',
  },
  sr: {
    settings: 'Podešavanja',
    theme: 'Tema',
    light: 'Svetla',
    dark: 'Tamna',
    language: 'Jezik',
    english: 'Eng',
    serbian: 'Srpski',
    close: 'Zatvori',
  },
}

export function useLanguage() {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT
    } catch {
      return DEFAULT
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch (_) {}
  }, [lang])

  const setLang = (next) => {
    setLangState(next === 'sr' ? 'sr' : 'en')
  }

  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key

  return [lang, setLang, t]
}
