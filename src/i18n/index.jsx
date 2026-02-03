import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { locales, languageOptions } from './locales';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    // Try to get saved language or detect from browser
    const saved = localStorage.getItem('language');
    if (saved && locales[saved]) return saved;
    
    const browserLang = navigator.language.split('-')[0];
    if (locales[browserLang]) return browserLang;
    
    return 'en';
  });

  // 更新 HTML lang 属性
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback((key) => {
    return locales[locale]?.[key] || locales.en[key] || key;
  }, [locale]);

  const changeLocale = useCallback((newLocale) => {
    if (locales[newLocale]) {
      setLocale(newLocale);
      localStorage.setItem('language', newLocale);
    }
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale, languageOptions }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
