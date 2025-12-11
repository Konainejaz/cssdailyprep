import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../services/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // 1. Check localStorage
    const savedLang = localStorage.getItem('css-prep-lang') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      // 2. Check browser settings
      const browserLang = navigator.language;
      if (browserLang.startsWith('ur')) {
        setLanguage('ur');
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('css-prep-lang', lang);
  };

  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
