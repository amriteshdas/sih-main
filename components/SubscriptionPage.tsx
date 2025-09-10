import React from 'react';
import { CheckIcon, ChevronLeftIcon } from './shared/IconComponents';
import { useI18n } from '../contexts/I18nContext';
import { Page } from '../types';

interface SubscriptionPageProps {
  hasSubscription: boolean;
  onUpgrade: () => void;
  onNavClick: (page: Page) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ hasSubscription, onUpgrade, onNavClick }) => {
    const { t } = useI18n();

    const tiers = [
        {
          nameKey: 'subscription.tiers.basic.name',
          price: t('subscription.free'),
          features: [
            t('subscription.tiers.basic.feature1'),
            t('subscription.tiers.basic.feature2'),
            t('subscription.tiers.basic.feature3'),
            t('subscription.tiers.basic.feature4'),
          ],
          cta: t('subscription.currentPlan'),
          isCurrent: !hasSubscription,
        },
        {
          nameKey: 'subscription.tiers.pro.name',
          price: '$49',
          price_suffix: t('subscription.perMonth'),
          features: [
            t('subscription.tiers.pro.feature1'),
            t('subscription.tiers.pro.feature2'),
            t('subscription.tiers.pro.feature3'),
            t('subscription.tiers.pro.feature4'),
            t('subscription.tiers.pro.feature5'),
          ],
          cta: t('subscription.tiers.pro.cta'),
          isCurrent: hasSubscription,
          isPopular: true,
        },
        {
          nameKey: 'subscription.tiers.enterprise.name',
          price: t('subscription.contactUs'),
          features: [
            t('subscription.tiers.enterprise.feature1'),
            t('subscription.tiers.enterprise.feature2'),
            t('subscription.tiers.enterprise.feature3'),
            t('subscription.tiers.enterprise.feature4'),
            t('subscription.tiers.enterprise.feature5'),
          ],
          cta: t('subscription.tiers.enterprise.cta'),
          isCurrent: false,
        },
      ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 max-w-5xl mx-auto mb-6">
            <button 
                onClick={() => onNavClick(Page.Home)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label={t('tooltips.backToDashboard')}
            >
                <ChevronLeftIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary" />
            </button>
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('pageTitles.subscription')}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {tiers.map((tier) => (
          <div key={tier.nameKey} className={`bg-card dark:bg-dark-card rounded-2xl shadow-lg p-8 flex flex-col ${tier.isPopular ? 'border-2 border-primary' : 'border border-border dark:border-dark-border'}`}>
             {tier.isPopular && <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full self-center mb-4 -mt-12">{t('subscription.mostPopular')}</span>}
            <h2 className="text-2xl font-bold text-center text-text-primary dark:text-dark-text-primary">{t(tier.nameKey)}</h2>
            <div className="mt-4 text-center">
              <span className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{tier.price}</span>
              {tier.price_suffix && <span className="text-text-secondary dark:text-dark-text-secondary">{tier.price_suffix}</span>}
            </div>
            <ul className="mt-8 space-y-4 flex-grow">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <CheckIcon className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
                  <span className="text-text-secondary dark:text-dark-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={tier.nameKey === 'subscription.tiers.pro.name' ? onUpgrade : undefined}
              disabled={tier.isCurrent}
              className={`w-full mt-8 py-3 px-6 rounded-lg font-semibold transition-colors ${
                tier.isCurrent
                  ? 'bg-slate-200 dark:bg-slate-600 text-text-secondary dark:text-dark-text-secondary'
                  : tier.isPopular ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-secondary hover:bg-slate-600 text-white'
              }`}
            >
              {tier.isCurrent ? t('subscription.currentPlan') : tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};