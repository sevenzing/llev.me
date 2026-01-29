import { TranslationKeys } from './translations/en';

export type Language = 'en' | 'ru';
export type { TranslationKeys };

export const languageNames: Record<Language, string> = {
    en: 'English',
    ru: 'Русский',
};

export function getLocaleByLanguage(language: Language) {
    switch (language) {
        case 'en':
            return 'en-US';
        case 'ru':
            return 'ru-RU';
        default:
            return 'en-US';
    }
}

export function getHour12UsageByLanguage(language: Language) {
    switch (language) {
        case 'en':
            return true;
        case 'ru':
            return false;
        default:
            return true;
    }
}
