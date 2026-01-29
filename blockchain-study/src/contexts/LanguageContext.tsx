"use client";

import { createContext, useContext, useState, useEffect, ReactNode, Suspense } from 'react';
import { Language, TranslationKeys } from '@/lib/translations';
import { en } from '@/lib/translations/en';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: TranslationKeys;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function LanguageProviderInner({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');
    const [t, setT] = useState<TranslationKeys>(en);
    const [isLoading, setIsLoading] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Load language from query param or cookie on mount
    useEffect(() => {
        const queryLang = searchParams.get('lang')?.toLowerCase();
        let langToSet: Language = 'en';

        if (queryLang === 'ru' || queryLang === 'en') {
            langToSet = queryLang as Language;
        } else {
            const savedLang = document.cookie
                .split('; ')
                .find(row => row.startsWith('language='))
                ?.split('=')[1] as Language | undefined;

            if (savedLang === 'ru' || savedLang === 'en') {
                langToSet = savedLang;
            }
        }

        if (langToSet !== language) {
            handleLanguageChange(langToSet, false);
        } else if (langToSet === 'ru' && t === en) {
            // Initial load for RU if state was default
            handleLanguageChange('ru', false);
        }
    }, [searchParams]);

    const handleLanguageChange = async (lang: Language, updateUrl: boolean = true) => {
        setIsLoading(true);
        setLanguageState(lang);

        // Update cookie
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = `language=${lang}; expires=${expires.toUTCString()}; path=/`;

        // Load translations
        if (lang === 'en') {
            setT(en);
        } else if (lang === 'ru') {
            try {
                const { ru } = await import('@/lib/translations/ru');
                setT(ru);
            } catch (error) {
                console.error('Failed to load Russian translations', error);
                setT(en); // Fallback
            }
        }

        setIsLoading(false);

        if (updateUrl) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('lang', lang.toUpperCase());
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        }
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage: (lang) => handleLanguageChange(lang, true),
            t,
            isLoading
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<>{children}</>}>
            <LanguageProviderInner>{children}</LanguageProviderInner>
        </Suspense>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
