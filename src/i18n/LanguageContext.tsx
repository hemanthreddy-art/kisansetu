'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, translations, TranslationDictionary } from './translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to Marathi ('mr') as per Maharashtra SIH Problem Statement focus, fallback 'en'
  const [locale, setLocaleState] = useState<Locale>('mr');

  useEffect(() => {
    // Check if user previously selected another language
    const saved = localStorage.getItem('kisansetu_locale') as Locale | null;
    if (saved && (saved === 'en' || saved === 'mr' || saved === 'te' || saved === 'hi')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('kisansetu_locale', newLocale);
  };

  const t = translations[locale] || translations.en;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
