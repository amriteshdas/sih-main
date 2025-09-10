import React from 'react';
import { useI18n } from '../../contexts/I18nContext';
import { languages } from '../../i18n/config';

export const LanguageSelector: React.FC = () => {
    const { lang, setLang, t } = useI18n();

    return (
        <div className="space-y-1">
            <label htmlFor="language-selector" className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{t('login.languageLabel')}</label>
            <select
                id="language-selector"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            >
                {Object.keys(languages).map((lng) => (
                    <option key={lng} value={lng}>
                        {languages[lng as keyof typeof languages].nativeName}
                    </option>
                ))}
            </select>
        </div>
    );
}