import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { languages, defaultLang } from '../i18n/config';

// This is a simplified i18n context. For production, a library like i18next is recommended.

interface I18nContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper to access nested properties by dot notation
const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((acc, k) => acc && acc[k], obj);
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<string>(localStorage.getItem('lang') || defaultLang);
  const [translations, setTranslations] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const fetchTranslations = async (language: string) => {
      try {
        const res = await fetch(`/locales/${language}.json`);
        if (!res.ok) throw new Error(`Failed to load translation file for ${language}`);
        const data = await res.json();
        setTranslations(data);
      } catch (error) {
        console.error(error);
        if (language !== defaultLang) {
          // Fallback to the default language if the selected one fails
          await fetchTranslations(defaultLang);
        }
      }
    };
    fetchTranslations(lang);
  }, [lang]);

  const setLang = useCallback((newLang: string) => {
    if (languages[newLang as keyof typeof languages]) {
      setLangState(newLang);
      localStorage.setItem('lang', newLang);
    }
  }, []);

  const t = useCallback((key: string, options?: { [key: string]: string | number }) => {
    let translation = getNestedTranslation(translations, key);

    if (translation === undefined) {
      console.warn(`Translation not found for key: ${key}`);
      return key; // Return the key itself as a fallback
    }

    if (typeof translation !== 'string') {
        console.warn(`Translation for key: ${key} is not a string.`);
        return key;
    }

    if (options) {
      Object.keys(options).forEach(optKey => {
        const regex = new RegExp(`{{${optKey}}}`, 'g');
        translation = (translation as string).replace(regex, String(options[optKey]));
      });
    }
    
    return translation;
  }, [translations]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};