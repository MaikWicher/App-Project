import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
    const { i18n } = useTranslation();

    const changeLanguage = async (languageCode: string) => {
        await i18n.changeLanguage(languageCode);
    };

    const availableLanguages = [
        { code: 'pl', name: 'Polski', flag: '🇵🇱' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
    ];

    return {
        currentLanguage: i18n.language,
        changeLanguage,
        availableLanguages
    };
};
