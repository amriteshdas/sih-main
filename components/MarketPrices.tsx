import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Page } from '../types';
import { Card } from './shared/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUpIcon, ScaleIcon, ExclamationTriangleIcon, ChevronLeftIcon } from './shared/IconComponents';

interface MarketPricesProps {
    onNavClick: (page: Page) => void;
}

const priceData = {
    wheat: [ { name: '-3w', price: 2050 }, { name: '-2w', price: 2080 }, { name: '-1w', price: 2100 }, { name: 'Now', price: 2150 }, { name: '+1w', price: 2180 }, { name: '+2w', price: 2200 } ],
    onion: [ { name: '-3w', price: 1800 }, { name: '-2w', price: 1750 }, { name: '-1w', price: 1850 }, { name: 'Now', price: 2200 }, { name: '+1w', price: 2500 }, { name: '+2w', price: 2400 } ],
    tomatoes: [ { name: '-3w', price: 3000 }, { name: '-2w', price: 2800 }, { name: '-1w', price: 2750 }, { name: 'Now', price: 2700 }, { name: '+1w', price: 2600 }, { name: '+2w', price: 2650 } ],
};


export const MarketPrices: React.FC<MarketPricesProps> = ({ onNavClick }) => {
    const { t } = useI18n();

    const mandiData = [
        { crop: t('dashboard.suggestions.crops.wheat'), price: 2150, change: 2.4 },
        { crop: t('dashboard.suggestions.crops.onion'), price: 2200, change: 18.9 },
        { crop: t('dashboard.suggestions.crops.tomatoes'), price: 2700, change: -1.8 },
        { crop: t('dashboard.suggestions.crops.potato'), price: 1500, change: 0.5 },
        { crop: t('dashboard.suggestions.crops.maize'), price: 1980, change: 1.2 },
    ];

    const marketCenters = [
        { name: 'Coimbatore Central', distance: '12km', priceDiff: 0 },
        { name: 'Pollachi Market', distance: '45km', priceDiff: 50 },
        { name: 'Tiruppur Bazaar', distance: '55km', priceDiff: -25 },
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
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('pageTitles.marketPrices')}</h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live Mandi Prices */}
                <Card title={t('marketPrices.livePrices.title')} className="lg:col-span-1">
                     <div className="space-y-3">
                        {mandiData.map(item => (
                            <div key={item.crop} className="flex justify-between items-center p-3 bg-background dark:bg-dark-background rounded-lg">
                                <p className="font-semibold text-text-primary dark:text-dark-text-primary">{item.crop}</p>
                                <div className="text-right">
                                    <p className="font-bold">₹{item.price}/qtl</p>
                                    <p className={`text-xs font-semibold ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {item.change >= 0 ? '▲' : '▼'} {item.change}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Price Trends & Alerts */}
                <div className="lg:col-span-2 space-y-6">
                     <Card title={t('marketPrices.trends.title')}>
                         <p className="text-sm text-text-secondary dark:text-dark-text-secondary -mt-3 mb-4">{t('marketPrices.trends.description')}</p>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke={'#475569'}/>
                                <YAxis stroke={'#475569'}/>
                                <RechartsTooltip contentStyle={{ backgroundColor: 'black', opacity: 0.8 }}/>
                                <Legend />
                                <Line type="monotone" name={t('dashboard.suggestions.crops.wheat')} data={priceData.wheat} dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} />
                                <Line type="monotone" name={t('dashboard.suggestions.crops.onion')} data={priceData.onion} dataKey="price" stroke="#82ca9d" strokeWidth={2} dot={false} />
                                <Line type="monotone" name={t('dashboard.suggestions.crops.tomatoes')} data={priceData.tomatoes} dataKey="price" stroke="#ff7300" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                    
                    <Card title={t('marketPrices.alerts.title')}>
                        <div className="p-4 rounded-lg border-l-4 bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700">
                            <div className="flex items-start">
                                <ExclamationTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                                <div>
                                    <p className="font-bold">{t('marketPrices.alerts.alert1.title')}</p>
                                    <p className="text-sm mt-1">{t('marketPrices.alerts.alert1.description')}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Nearest Market Centers */}
                <Card title={t('marketPrices.nearestMarkets.title')} className="lg:col-span-3">
                     <p className="text-sm text-text-secondary dark:text-dark-text-secondary -mt-3 mb-4">{t('marketPrices.nearestMarkets.description')}</p>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {marketCenters.map(market => (
                            <div key={market.name} className="p-4 rounded-lg bg-background dark:bg-dark-background text-center">
                                <h3 className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{market.name}</h3>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{market.distance} away</p>
                                <p className={`mt-2 text-xl font-bold ${market.priceDiff > 0 ? 'text-green-500' : market.priceDiff < 0 ? 'text-red-500' : 'text-text-secondary'}`}>
                                    {market.priceDiff > 0 ? `+₹${market.priceDiff}` : market.priceDiff < 0 ? `-₹${Math.abs(market.priceDiff)}` : 'Same Price'}
                                </p>
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">per Quintal</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}