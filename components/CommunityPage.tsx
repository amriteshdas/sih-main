import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Page } from '../types';
import { Card } from './shared/Card';
import { UsersIcon, VideoCameraIcon, SparklesIcon, ChevronLeftIcon } from './shared/IconComponents';

interface CommunityPageProps {
    onNavClick: (page: Page) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onNavClick }) => {
    const { t } = useI18n();

    const discussionGroups = [
        { name: t('community.groups.group1'), members: 128 },
        { name: t('community.groups.group2'), members: 74 },
        { name: t('community.groups.group3'), members: 205 },
    ];

    const videoTutorials = [
        { title: t('community.videos.video1.title'), duration: '5:42', thumbnail: 'https://storage.googleapis.com/maker-studio-project-media-prod/media/20240711130311_354_farm_view.png' },
        { title: t('community.videos.video2.title'), duration: '8:15', thumbnail: 'https://storage.googleapis.com/maker-studio-project-media-prod/media/20240711130311_354_farm_view.png' },
        { title: t('community.videos.video3.title'), duration: '3:50', thumbnail: 'https://storage.googleapis.com/maker-studio-project-media-prod/media/20240711130311_354_farm_view.png' },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => onNavClick(Page.Home)}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label={t('tooltips.backToDashboard')}
                >
                    <ChevronLeftIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary" />
                </button>
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('pageTitles.community')}</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title={t('community.videos.title')}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {videoTutorials.map((video, index) => (
                                <div key={index} className="rounded-lg overflow-hidden group cursor-pointer">
                                    <div className="relative">
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40"></div>
                                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded-md">{video.duration}</span>
                                    </div>
                                    <h3 className="font-semibold text-sm mt-2 text-text-primary dark:text-dark-text-primary">{video.title}</h3>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1 row-start-1 lg:row-start-auto">
                    <Card title={t('community.groups.title')}>
                         <div className="space-y-3">
                            {discussionGroups.map((group, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-background dark:bg-dark-background rounded-lg">
                                    <div>
                                        <p className="font-semibold text-text-primary dark:text-dark-text-primary">{group.name}</p>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{group.members} {t('community.groups.members')}</p>
                                    </div>
                                    <button className="px-3 py-1 text-sm bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors">{t('community.groups.joinButton')}</button>
                                </div>
                            ))}
                         </div>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                     <Card title={t('community.successStories.title')}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <SparklesIcon className="w-8 h-8 text-primary" />
                                <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">{t('community.successStories.story1.title')}</h3>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">"{t('community.successStories.story1.quote')}"</p>
                                <p className="text-xs font-semibold text-right">- {t('community.successStories.story1.author')}</p>
                            </div>
                            <div className="space-y-2">
                                <SparklesIcon className="w-8 h-8 text-primary" />
                                <h3 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">{t('community.successStories.story2.title')}</h3>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">"{t('community.successStories.story2.quote')}"</p>
                                <p className="text-xs font-semibold text-right">- {t('community.successStories.story2.author')}</p>
                            </div>
                        </div>
                    </Card>
                </div>
                 <div className="lg:col-span-3">
                     <Card title={t('community.govtSchemes.title')}>
                         <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">{t('community.govtSchemes.description')}</p>
                         <ul className="list-disc ml-5 space-y-2 text-text-primary dark:text-dark-text-primary">
                            <li><a href="#" className="text-primary hover:underline">{t('community.govtSchemes.scheme1')}</a></li>
                            <li><a href="#" className="text-primary hover:underline">{t('community.govtSchemes.scheme2')}</a></li>
                         </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}