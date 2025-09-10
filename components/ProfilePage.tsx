import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Page } from '../types';
import { UserCircleIcon, MapIcon, BeakerIcon, PencilIcon, ChevronLeftIcon } from './shared/IconComponents';

interface ProfilePageProps {
    onNavClick: (page: Page) => void;
}

const ProfileCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-card dark:bg-dark-card rounded-xl shadow-md p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">{title}</h2>
            <button className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1">
                <PencilIcon className="w-4 h-4" />
                {('Edit')}
            </button>
        </div>
        {children}
    </div>
);

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{label}</p>
        <p className="font-semibold text-text-primary dark:text-dark-text-primary">{value}</p>
    </div>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavClick }) => {
    const { t } = useI18n();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => onNavClick(Page.Home)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label={t('tooltips.backToDashboard')}
                >
                    <ChevronLeftIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary" />
                </button>
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('pageTitles.profile')}</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Profile Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card dark:bg-dark-card rounded-xl shadow-md p-6 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4">
                            <UserCircleIcon className="w-20 h-20 text-slate-500 dark:text-slate-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Demo Farmer</h2>
                        <p className="text-text-secondary dark:text-dark-text-secondary">Coimbatore, Tamil Nadu</p>
                    </div>
                     <ProfileCard title={t('profile.contactInfo.title')}>
                        <div className="space-y-3">
                            <InfoItem label={t('profile.contactInfo.email')} value="demo.farmer@sarvanam.ai" />
                            <InfoItem label={t('profile.contactInfo.phone')} value="+91 98765 43210" />
                        </div>
                    </ProfileCard>
                </div>

                {/* Right Column: Farm Details */}
                <div className="md:col-span-2 space-y-6">
                    <ProfileCard title={t('profile.farmDetails.title')}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoItem label={t('profile.farmDetails.farmSize')} value="5 Acres" />
                            <InfoItem label={t('profile.farmDetails.primaryCrops')} value="Rice, Wheat, Sugarcane" />
                            <InfoItem label={t('profile.farmDetails.soilType')} value="Loam" />
                            <InfoItem label={t('profile.farmDetails.irrigation')} value="Drip Irrigation" />
                        </div>
                    </ProfileCard>
                    <div className="bg-card dark:bg-dark-card rounded-xl shadow-md p-6">
                         <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('profile.reminders.title')}</h2>
                         <p className="text-text-secondary dark:text-dark-text-secondary">{t('profile.reminders.description')}</p>
                         <p className="text-sm mt-2">{t('profile.reminders.note')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};