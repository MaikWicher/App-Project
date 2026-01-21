import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import Backend from 'i18next-http-backend';
import resources from './resources';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    // .use(Backend) // Removed HTTP loading
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources, // Pass imported resources
        fallbackLng: 'en',
        supportedLngs: ['pl', 'en', 'de', 'es', 'fr'],
        ns: ['common', 'menu', 'panels', 'tables', 'charts', 'graphs', 'errors', 'settings'],
        defaultNS: 'common',

        debug: import.meta.env.DEV,

        interpolation: {
            escapeValue: false,
        },

        // Backend config removed

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },

        react: {
            useSuspense: true,
        },
    });

export default i18n;
