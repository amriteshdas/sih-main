import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import { ChartSquareBarIcon, ViewGridIcon, Tooltip, HomeIcon, ArrowLeftIcon } from './shared/IconComponents';

interface BottomNavBarProps {
  viewMode: 'basic' | 'pro';
  onSetViewMode: (mode: 'basic' | 'pro') => void;
  hasSubscription: boolean;
  onBack?: () => void;
  onHome?: () => void;
  canGoBack?: boolean;
}

const ViewModeButton: React.FC<{
    label: string;
    tooltipText: string;
    mode: 'basic' | 'pro';
    isActive: boolean;
    isDisabled?: boolean;
    onClick: (mode: 'basic' | 'pro') => void;
    children: React.ReactNode;
}> = ({ label, tooltipText, mode, isActive, isDisabled, onClick, children }) => (
    <Tooltip text={tooltipText} position="top">
        <button
            onClick={() => onClick(mode)}
            disabled={isDisabled}
            className={`flex flex-col items-center justify-center w-24 h-full text-xs font-medium transition-colors ${
                isActive
                ? 'text-primary'
                : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-current={isActive ? 'page' : undefined}
            aria-label={tooltipText}
        >
            {children}
            <span className="mt-1">{label}</span>
        </button>
    </Tooltip>
);


export const BottomNavBar: React.FC<BottomNavBarProps> = ({ viewMode, onSetViewMode, hasSubscription, onBack, onHome, canGoBack }) => {
  const { t } = useI18n();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card dark:bg-dark-card shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.4)] flex justify-center items-center h-16 border-t border-border dark:border-dark-border z-30 gap-6">
        {/* Back & Home */}
        <div className="absolute left-4 flex items-center gap-3">
            <Tooltip text={t('Back') || 'Back'} position="top">
                <button
                    onClick={onBack}
                    disabled={!canGoBack}
                    className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center transition-colors hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={t('tooltips.back') || 'Back'}
                >
                    <ArrowLeftIcon className="w-5 h-5 text-text-secondary dark:text-dark-text-secondary" />
                </button>
            </Tooltip>
            <Tooltip text={t('Home') || 'Home'} position="top">
                <button
                    onClick={onHome}
                    className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                    aria-label={t('tooltips.home') || 'Home'}
                >
                    <HomeIcon className="w-5 h-5 text-text-secondary dark:text-dark-text-secondary" />
                </button>
            </Tooltip>
        </div>

        <ViewModeButton
            label={t('nav.basic')}
            tooltipText={t('tooltips.showBasicView')}
            mode="basic"
            isActive={viewMode === 'basic'}
            onClick={onSetViewMode}
        >
            <ChartSquareBarIcon className="w-6 h-6" />
        </ViewModeButton>
        
        <ViewModeButton
            label={t('nav.pro')}
            tooltipText={hasSubscription ? t('tooltips.showProView') : t('tooltips.proRequired')}
            mode="pro"
            isActive={viewMode === 'pro'}
            isDisabled={!hasSubscription}
            onClick={onSetViewMode}
        >
            <ViewGridIcon className="w-6 h-6" />
        </ViewModeButton>

        
    </nav>
  );
};
