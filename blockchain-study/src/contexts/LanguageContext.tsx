"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');

    // Load language from cookie on mount
    useEffect(() => {
        const savedLang = document.cookie
            .split('; ')
            .find(row => row.startsWith('language='))
            ?.split('=')[1] as Language | undefined;

        if (savedLang && (savedLang === 'en' || savedLang === 'ru')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        // Save to cookie (expires in 1 year)
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `language=${lang}; expires=${expires.toUTCString()}; path=/`;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
