import React from 'react';
import { UserIcon, LogoutIcon, CpuChipIcon, Tooltip, UserCircleIcon, ChevronLeftIcon } from './shared/IconComponents';
import { useI18n } from '../contexts/I18nContext';
import { LanguageSelector } from './shared/LanguageSelector';
import { Page } from '../types';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onNavClick: (page: Page) => void;
  viewMode: 'basic' | 'pro';
  onSetViewMode: (mode: 'basic' | 'pro') => void;
  onSetHasSubscription: (subscribed: boolean) => void;
  hasSubscription: boolean;
}

const SettingsCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-card dark:bg-dark-card rounded-xl shadow-md p-6 ${className}`}>
    <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{title}</h2>
    {children}
  </div>
);

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}> = ({ checked, onChange, ariaLabel }) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`${checked ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-dark-card`}
      aria-label={ariaLabel}
    >
      <span
        aria-hidden="true"
        className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme, onToggleTheme, onLogout, onNavClick, viewMode, onSetViewMode, hasSubscription, onSetHasSubscription }) => {
  const { t } = useI18n();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 max-w-4xl mx-auto mb-6">
            <button 
                onClick={() => onNavClick(Page.Home)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label={t('tooltips.backToDashboard')}
            >
                <ChevronLeftIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary" />
            </button>
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('pageTitles.settings')}</h1>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsCard title={t('settings.account.title')}>
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-slate-500 dark:text-slate-400"/>
                </div>
                <div>
                    <p className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Demo Farmer</p>
                    <p className="text-text-secondary dark:text-dark-text-secondary">demo.farmer@sarvanam.ai</p>
                     <button onClick={() => onNavClick(Page.Profile)} className="mt-2 text-sm font-semibold text-primary hover:text-primary-dark dark:hover:text-green-400 flex items-center gap-1">
                        <UserCircleIcon className="w-4 h-4" />
                        {t('settings.account.viewProfile')}
                    </button>
                </div>
            </div>
        </SettingsCard>

        <SettingsCard title={t('settings.appearance.title')}>
          <div className="flex items-center justify-between">
            <p className="text-text-secondary dark:text-dark-text-secondary">{t('settings.appearance.description')}</p>
             <ToggleSwitch 
                checked={theme === 'dark'}
                onChange={onToggleTheme}
                ariaLabel={t('settings.appearance.toggleAriaLabel', { theme: theme === 'light' ? 'dark' : 'light' })}
             />
          </div>
        </SettingsCard>

        <SettingsCard title={t('settings.language.title')}>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-4">{t('settings.language.description')}</p>
            <LanguageSelector />
        </SettingsCard>

        <SettingsCard title={t('settings.viewMode.title')}>
            <p className="text-text-secondary dark:text-dark-text-secondary mb-4">{t('settings.viewMode.description')}</p>
            <div className="flex w-full bg-background dark:bg-dark-background rounded-lg p-1">
                <button
                    onClick={() => onSetViewMode('basic')}
                    className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                        viewMode === 'basic'
                            ? 'bg-primary text-white shadow'
                            : 'bg-transparent text-text-secondary dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    {t('settings.viewMode.basic')}
                </button>
                <Tooltip text={!hasSubscription ? t('tooltips.proRequired') : ''} position="top">
                    <button
                        onClick={() => onSetViewMode('pro')}
                        disabled={!hasSubscription}
                        className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors ${
                            viewMode === 'pro'
                                ? 'bg-primary text-white shadow'
                                : 'bg-transparent text-text-secondary dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {t('settings.viewMode.pro')}
                    </button>
                </Tooltip>
            </div>
             {viewMode === 'pro' && (
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-3">
                    {t('settings.viewMode.proDescription')}
                </p>
            )}
        </SettingsCard>

        <SettingsCard title={t('settings.subscription.title')}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-text-primary dark:text-dark-text-primary">{hasSubscription ? t('settings.subscription.statusActive') : t('settings.subscription.statusInactive')}</p>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{t('settings.subscription.description')}</p>
                </div>
                <ToggleSwitch 
                    checked={hasSubscription}
                    onChange={() => onSetHasSubscription(!hasSubscription)}
                    ariaLabel={t('settings.subscription.toggleAriaLabel')}
                />
            </div>
            {!hasSubscription && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-center text-sm text-blue-700 dark:text-blue-300">
                    <p>{t('settings.subscription.upgradeNote')} <span onClick={() => onNavClick(Page.Subscription)} className="font-semibold cursor-pointer hover:underline">{t('settings.subscription.upgradeLink')}</span></p>
                </div>
            )}
        </SettingsCard>
        
        <SettingsCard title={t('settings.deviceIntegration.title')} className="md:col-span-2">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-text-primary dark:text-dark-text-primary">{t('settings.deviceIntegration.setupGuide.title')}</p>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{t('settings.deviceIntegration.setupGuide.description')}</p>
                </div>
                 <Tooltip text={t('tooltips.viewDeviceGuide')}>
                  <button
                      onClick={() => onNavClick(Page.DeviceSetup)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-secondary text-white hover:bg-slate-600 transition-colors whitespace-nowrap"
                  >
                      <CpuChipIcon className="w-5 h-5" />
                      <span>{t('settings.deviceIntegration.button')}</span>
                  </button>
                </Tooltip>
            </div>
        </SettingsCard>

        <SettingsCard title={t('settings.actions.title')} className="md:col-span-2">
            <div className="flex items-center justify-between">
                 <p className="text-text-secondary dark:text-dark-text-secondary">{t('settings.actions.logoutDescription')}</p>
                 <Tooltip text={t('tooltips.logout')}>
                    <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span>{t('settings.actions.logoutButton')}</span>
                    </button>
                 </Tooltip>
            </div>
        </SettingsCard>
      </div>
    </div>
  );
};