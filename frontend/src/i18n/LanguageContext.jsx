import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LANGUAGES, translations } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('duesportal_lang');
      if (saved && translations[saved]) {
        return saved;
      }
      // Check browser default
      const browserLang = navigator.language?.slice(0, 2)?.toLowerCase();
      if (browserLang && translations[browserLang]) {
        return browserLang;
      }
    } catch {
      // Ignored
    }
    return 'en';
  });

  const setLanguage = useCallback((newLang) => {
    if (translations[newLang]) {
      setLanguageState(newLang);
      try {
        localStorage.setItem('duesportal_lang', newLang);
        document.documentElement.lang = newLang;
      } catch {
        // Ignored
      }
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // Ignored
    }
  }, [language]);

  /**
   * Fast translation lookup helper
   * @param {string} keyPath - e.g. 'nav.dashboard'
   * @param {Object} [params] - optional interpolation params { count: 5 }
   * @param {string} [fallback] - fallback text if key not found
   */
  const t = useCallback((keyPath, params = null, fallback = '') => {
    if (!keyPath) return fallback;

    const currentDict = translations[language] || translations['en'];
    const fallbackDict = translations['en'];

    const getNestedValue = (obj, path) => {
      const keys = path.split('.');
      let current = obj;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return undefined;
        }
      }
      return current;
    };

    let result = getNestedValue(currentDict, keyPath);
    if (result === undefined) {
      result = getNestedValue(fallbackDict, keyPath);
    }
    if (result === undefined) {
      result = fallback || keyPath;
    }

    if (typeof result === 'string' && params && typeof params === 'object') {
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), params[paramKey]);
      });
    }

    return result;
  }, [language]);

  const currentLanguageInfo = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      languages: LANGUAGES,
      currentLanguageInfo
    }}>
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

export function useTranslation() {
  const { t, language, setLanguage, languages, currentLanguageInfo } = useLanguage();
  return { t, language, setLanguage, languages, currentLanguageInfo };
}

export default LanguageContext;

