import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Dropdown, Option, type OptionOnSelectData, type SelectionEvents } from '@fluentui/react-components';

export const LanguageSelector: React.FC = () => {
    const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

    const onOptionSelect = (_: SelectionEvents, data: OptionOnSelectData) => {
        if (data.optionValue) {
            changeLanguage(data.optionValue);
        }
    };

    // Simplify current language code (e.g. 'en-US' -> 'en')
    const activeLangCode = currentLanguage?.split('-')[0] || 'en';
    const activeLangConfig = availableLanguages.find(l => l.code === activeLangCode);

    return (
        <div style={{ padding: '0 8px' }}>
            <Dropdown
                placeholder="Język / Language"
                value={activeLangConfig ? `${activeLangConfig.flag} ${activeLangConfig.name}` : activeLangCode}
                selectedOptions={[activeLangCode]}
                onOptionSelect={onOptionSelect}
                style={{ minWidth: '140px' }}
            >
                {availableLanguages.map((lang) => (
                    <Option key={lang.code} value={lang.code} text={lang.name}>
                        <span style={{ marginRight: '8px' }}>{lang.flag}</span>
                        {lang.name}
                    </Option>
                ))}
            </Dropdown>
        </div>
    );
};
