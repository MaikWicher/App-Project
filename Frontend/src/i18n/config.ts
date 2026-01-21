import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        supportedLngs: ['pl', 'en', 'de', 'es', 'fr'],
        ns: ['common', 'menu', 'panels', 'tables', 'charts', 'graphs', 'errors', 'settings'],
        defaultNS: 'common',

        debug: import.meta.env.DEV, // Enable debug in dev mode

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },

        react: {
            useSuspense: true,
        },
    });

export default i18n;
