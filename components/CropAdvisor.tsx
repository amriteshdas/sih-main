import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Page, SensorData, WeatherData } from '../types';
import { LightBulbIcon, CheckCircleIcon, CalendarDaysIcon, EyeIcon, TrashIcon, ChevronLeftIcon } from './shared/IconComponents';

interface CropAdvisorProps {
  sensorData: SensorData;
  weatherData: WeatherData;
  onNavClick: (page: Page) => void;
  viewPlanKey?: string | null;
  onClearViewPlan: () => void;
}

const allCrops = [
    { key: 'tomatoes', nameKey: 'dashboard.suggestions.crops.tomatoes', emoji: '🍅', yield: '25-40', profit: 'High', sustainability: 85 },
    { key: 'lettuce', nameKey: 'dashboard.suggestions.crops.lettuce', emoji: '🥬', yield: '10-15', profit: 'Medium', sustainability: 92 },
    { key: 'carrots', nameKey: 'dashboard.suggestions.crops.carrots', emoji: '🥕', yield: '20-30', profit: 'Medium', sustainability: 88 },
    { key: 'peppers', nameKey: 'dashboard.suggestions.crops.peppers', emoji: '🌶️', yield: '15-25', profit: 'High', sustainability: 82 },
    { key: 'broccoli', nameKey: 'dashboard.suggestions.crops.broccoli', emoji: '🥦', yield: '8-12', profit: 'Medium', sustainability: 90 },
    { key: 'spinach', nameKey: 'dashboard.suggestions.crops.spinach', emoji: '🌿', yield: '12-18', profit: 'Medium', sustainability: 95 },
    { key: 'wheat', nameKey: 'dashboard.suggestions.crops.wheat', emoji: '🌾', yield: '2-3', profit: 'Low', sustainability: 75 },
    { key: 'rice', nameKey: 'dashboard.suggestions.crops.rice', emoji: '🍚', yield: '3-5', profit: 'Low', sustainability: 60 },
    { key: 'maize', nameKey: 'dashboard.suggestions.crops.maize', emoji: '🌽', yield: '4-6', profit: 'Medium', sustainability: 70 },
    { key: 'potato', nameKey: 'dashboard.suggestions.crops.potato', emoji: '🥔', yield: '30-50', profit: 'Medium', sustainability: 80 },
    { key: 'onion', nameKey: 'dashboard.suggestions.crops.onion', emoji: '🧅', yield: '20-35', profit: 'High', sustainability: 85 },
    { key: 'cabbage', nameKey: 'dashboard.suggestions.crops.cabbage', emoji: '🥬', yield: '25-45', profit: 'Medium', sustainability: 88 },
    { key: 'peas', nameKey: 'dashboard.suggestions.crops.peas', emoji: '🫛', yield: '3-6', profit: 'Medium', sustainability: 94 },
    { key: 'rye', nameKey: 'dashboard.suggestions.crops.rye', emoji: '🌾', yield: '1.5-2.5', profit: 'Low', sustainability: 85 },
];

type CropData = typeof allCrops[0];

type CropRecommendation = {
    crop: CropData;
    reasons: string[];
}

const generateRecommendation = (
  pastCrops: string[], 
  farmSize: number, 
  sensorData: SensorData, 
  weatherData: WeatherData
): CropRecommendation[] => {
    
    const scores = allCrops.map(crop => {
        let score = 0;
        let reasons: string[] = ['reasonScale'];

        if ((['tomatoes', 'peppers', 'maize', 'rice'].includes(crop.key)) && weatherData.temperature > 22 && sensorData.sunlightHours > 7) {
            score += 4;
            reasons.push('reasonWeather');
        }
        if ((['lettuce', 'spinach', 'broccoli', 'wheat', 'peas', 'cabbage', 'rye', 'potato', 'carrots'].includes(crop.key)) && weatherData.temperature < 22) {
            score += 3;
            reasons.push('reasonWeather');
        }
        if (sensorData.soilType === 'loam') {
            score += 2;
            reasons.push('reasonSoil');
        } else if (sensorData.soilType === 'sandy' && ['carrots', 'potato'].includes(crop.key)) {
            score += 2;
            reasons.push('reasonSoil');
        }

        if (!pastCrops.includes(crop.key)) {
            score += 3;
            reasons.push('reasonRotation');
        }

        return { crop, score, reasons };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, 3);
};

const generateCalendarTasks = (cropKey: string): { day: string; taskKey: string }[] => {
    switch (cropKey) {
        case 'wheat': case 'rye': case 'maize':
            return [ { day: '1-7', taskKey: 'prepareSoil' }, { day: '8', taskKey: 'planting' }, { day: '30-60', taskKey: 'fertilizing' }, { day: '45-90', taskKey: 'pestScouting' }, { day: '120', taskKey: 'harvesting' } ];
        case 'rice':
             return [ { day: '1-10', taskKey: 'preparePaddy' }, { day: '11', taskKey: 'transplanting' }, { day: '30-70', taskKey: 'waterManagement' }, { day: '40-80', taskKey: 'pestScouting' }, { day: '110', taskKey: 'harvesting' } ];
        default: // Vegetables
            return [ { day: '1-5', taskKey: 'prepareSoil' }, { day: '6', taskKey: 'planting' }, { day: '30-60', taskKey: 'fertilizing' }, { day: '15-75', taskKey: 'pestScouting' }, { day: '90', taskKey: 'harvesting' } ];
    }
};

const sustainabilityColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    return 'bg-orange-500';
}

export const CropAdvisor: React.FC<CropAdvisorProps> = ({ sensorData, weatherData, onNavClick, viewPlanKey, onClearViewPlan }) => {
  const { t } = useI18n();
  
  const getInitialCrop = () => {
    if (!viewPlanKey) return null;
    const cropToView = allCrops.find(c => c.key === viewPlanKey);
    return cropToView ? { crop: cropToView, reasons: [] } : null;
  };

  const [step, setStep] = useState<'form' | 'loading' | 'result' | 'details'>(viewPlanKey ? 'details' : 'form');
  const [pastCrops, setPastCrops] = useState<string[]>([]);
  const [farmSize, setFarmSize] = useState('');
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState<CropRecommendation[] | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<CropRecommendation | null>(getInitialCrop());
  const [isSaved, setIsSaved] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [compareList, setCompareList] = useState<CropData[]>([]);

    useEffect(() => {
        if (step === 'loading') {
            const messages = [ t('cropAdvisor.loading.message1'), t('cropAdvisor.loading.message2'), t('cropAdvisor.loading.message3'), t('cropAdvisor.loading.message4') ];
            let messageIndex = 0;
            setLoadingMessage(messages[messageIndex]);

            const interval = setInterval(() => {
                messageIndex++;
                if (messageIndex < messages.length) setLoadingMessage(messages[messageIndex]);
                else clearInterval(interval);
            }, 500);

             const analysisTimeout = setTimeout(() => {
                setRecommendations(generateRecommendation(pastCrops, parseFloat(farmSize) || 1, sensorData, weatherData));
                setStep('result');
            }, messages.length * 500);

            return () => { clearInterval(interval); clearTimeout(analysisTimeout); }
        }
    }, [step, pastCrops, farmSize, sensorData, weatherData, t]);

  const handlePastCropToggle = (cropKey: string) => setPastCrops(prev => prev.includes(cropKey) ? prev.filter(c => c !== cropKey) : [...prev, cropKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmSize || parseFloat(farmSize) <= 0) {
      setError(t('cropAdvisor.form.error'));
      return;
    }
    setError(''); setStep('loading');
  };
  
  const handleStartOver = () => {
    onClearViewPlan(); setPastCrops([]); setFarmSize(''); setError('');
    setRecommendations(null); setSelectedCrop(null); setCompareList([]); setStep('form');
  }

  const handleSelectRecommendation = (rec: CropRecommendation) => {
      setSelectedCrop(rec); setIsSaved(false); setStep('details');
  };

  const handleSavePlan = () => {
      if (!selectedCrop) return;
      const tasks = generateCalendarTasks(selectedCrop.crop.key);
      try {
          const savedData = localStorage.getItem('savedFarmingCalendars');
          const calendars = savedData ? JSON.parse(savedData) : {};
          calendars[selectedCrop.crop.key] = { cropKey: selectedCrop.crop.key, tasks };
          localStorage.setItem('savedFarmingCalendars', JSON.stringify(calendars));
          setIsSaved(true);
      } catch (e) { console.error("Failed to save calendar", e); }
  };

  const handleBackFromDetails = () => {
    if (viewPlanKey) { onClearViewPlan(); onNavClick(Page.Home); } 
    else { setSelectedCrop(null); setStep('result'); }
  };

  const handleCompareToggle = (crop: CropData) => {
      setCompareList(prev => {
          const isPresent = prev.some(c => c.key === crop.key);
          if (isPresent) return prev.filter(c => c.key !== crop.key);
          if (prev.length < 3) return [...prev, crop];
          return prev;
      });
  };

  const renderForm = () => (
    <div className="p-6">
      <div className="flex items-center gap-4 max-w-2xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary text-center w-full">{t('cropAdvisor.title')}</h1>
      </div>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-6 text-center max-w-2xl mx-auto">{t('cropAdvisor.form.description')}</p>
      
      <form onSubmit={handleSubmit} className="bg-card dark:bg-dark-card p-8 rounded-xl shadow-md space-y-6 max-w-2xl mx-auto">
        <div>
          <label className="block text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-3">{t('cropAdvisor.form.pastCropsLabel')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allCrops.slice(0, 8).map(crop => (
              <button type="button" key={crop.key} onClick={() => handlePastCropToggle(crop.key)} className={`p-3 rounded-lg border-2 text-center transition-colors ${pastCrops.includes(crop.key) ? 'bg-primary/10 border-primary' : 'bg-background dark:bg-dark-background border-border dark:border-dark-border hover:border-primary/50'}`}>
                <span className="text-3xl" role="img">{crop.emoji}</span>
                <p className="font-semibold mt-1 text-sm text-text-primary dark:text-dark-text-primary">{t(crop.nameKey)}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="farm-size" className="block text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-2">{t('cropAdvisor.form.farmSizeLabel')}</label>
          <input id="farm-size" type="number" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} placeholder={t('cropAdvisor.form.farmSizePlaceholder')} min="0.1" step="0.1" className="w-full px-4 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"/>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => onNavClick(Page.Home)} className="px-6 py-2 rounded-lg font-semibold bg-slate-200 dark:bg-slate-600 text-text-primary dark:text-dark-text-primary hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">{t('cropAdvisor.actions.backToDashboardButton')}</button>
            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors">{t('cropAdvisor.form.button')}</button>
        </div>
      </form>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6">
        <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative bg-primary/30 rounded-full w-24 h-24 flex items-center justify-center">
                <LightBulbIcon className="w-12 h-12 text-primary animate-pulse" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{t('cropAdvisor.loading.title')}</h2>
        <p className="text-text-secondary dark:text-dark-text-secondary mt-2 animate-pulse">{loadingMessage}</p>
    </div>
  );
  
  const renderResult = () => {
    if (!recommendations) return null;
    
    return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
        <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mb-2 text-center">{t('cropAdvisor.result.multipleTitle')}</h1>
        <p className="text-text-secondary dark:text-dark-text-secondary mb-6 text-center">{t('cropAdvisor.result.multipleDescription')}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
                 <div key={rec.crop.key} className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg flex flex-col">
                    <span className="text-7xl text-center" role="img">{rec.crop.emoji}</span>
                    <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mt-4 text-center">{t(rec.crop.nameKey)}</h2>
                    
                    <div className="mt-4 space-y-3">
                        <div>
                            <p className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">{t('cropAdvisor.result.yield')}</p>
                            <p className="font-bold text-text-primary dark:text-dark-text-primary">{rec.crop.yield} {t('cropAdvisor.result.yieldUnit')}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">{t('cropAdvisor.result.profit')}</p>
                            <p className="font-bold text-text-primary dark:text-dark-text-primary">{t(`cropAdvisor.result.profitLevels.${rec.crop.profit}`)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary">{t('cropAdvisor.result.sustainability')}</p>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-1">
                                <div className={`${sustainabilityColor(rec.crop.sustainability)} h-2.5 rounded-full`} style={{width: `${rec.crop.sustainability}%`}}></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow mt-4">
                        <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-2 text-center">{t('cropAdvisor.result.reasonsTitle')}</h3>
                        <div className="flex flex-col items-start text-left gap-2">
                             {rec.reasons.map(reasonKey => (
                                <p key={reasonKey} className="text-xs flex items-center gap-1.5 text-text-secondary dark:text-dark-text-secondary">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span>{t(`cropAdvisor.reasons.short.${reasonKey}`)}</span>
                                </p>
                             ))}
                        </div>
                    </div>
                    <div className="mt-6 space-y-2">
                        <button onClick={() => handleSelectRecommendation(rec)} className="w-full px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors">{t('cropAdvisor.actions.viewDetailsButton')}</button>
                        <button onClick={() => handleCompareToggle(rec.crop)} className={`w-full px-4 py-2 rounded-lg font-bold border-2 transition-colors ${compareList.some(c => c.key === rec.crop.key) ? 'bg-blue-500/10 text-blue-600 border-blue-500' : 'bg-transparent text-blue-500 border-blue-500/50 hover:bg-blue-500/10'}`}>{t('cropAdvisor.compare.button')}</button>
                    </div>
                </div>
            ))}
        </div>

        {compareList.length > 0 && (
            <div className="mt-8 bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('cropAdvisor.compare.title')}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border dark:border-dark-border">
                                <th className="p-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">{t('cropAdvisor.compare.metric')}</th>
                                {compareList.map(crop => <th key={crop.key} className="p-2 text-center text-sm font-bold text-text-primary dark:text-dark-text-primary">{t(crop.nameKey)}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-2 font-semibold">{t('cropAdvisor.result.yield')}</td>
                                {compareList.map(crop => <td key={crop.key} className="p-2 text-center">{crop.yield} {t('cropAdvisor.result.yieldUnit')}</td>)}
                            </tr>
                             <tr>
                                <td className="p-2 font-semibold">{t('cropAdvisor.result.profit')}</td>
                                {compareList.map(crop => <td key={crop.key} className="p-2 text-center">{t(`cropAdvisor.result.profitLevels.${crop.profit}`)}</td>)}
                            </tr>
                             <tr>
                                <td className="p-2 font-semibold">{t('cropAdvisor.result.sustainability')}</td>
                                {compareList.map(crop => <td key={crop.key} className="p-2 text-center">{crop.sustainability}%</td>)}
                            </tr>
                            <tr>
                                <td className="p-2"></td>
                                {compareList.map(crop => <td key={crop.key} className="p-2 text-center"><button onClick={() => handleCompareToggle(crop)}><TrashIcon className="w-5 h-5 text-red-500 hover:text-red-700"/></button></td>)}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        <div className="mt-8 text-center">
            <button onClick={handleStartOver} className="px-6 py-2 rounded-lg font-semibold bg-slate-200 dark:bg-slate-600 text-text-primary dark:text-dark-text-primary hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                {t('cropAdvisor.actions.startOverButton')}
            </button>
        </div>
    </div>
    )
  };

  const renderDetails = () => {
      if (!selectedCrop) return null;
      const { crop } = selectedCrop;
      const cropName = t(crop.nameKey);
      const calendarTasks = generateCalendarTasks(crop.key);
      const detailSections = [ { titleKey: 'cropDetails.sections.description', contentKey: `cropDetails.${crop.key}.description` }, { titleKey: 'cropDetails.sections.idealConditions', contentKey: `cropDetails.${crop.key}.idealConditions` }, { titleKey: 'cropDetails.sections.commonPests', contentKey: `cropDetails.${crop.key}.commonPests` }, { titleKey: 'cropDetails.sections.wateringNeeds', contentKey: `cropDetails.${crop.key}.wateringNeeds` } ];

      return (
         <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                    <button 
                        onClick={handleBackFromDetails}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label={viewPlanKey ? t('tooltips.backToDashboard') : t('cropAdvisor.actions.backToResultsButton')}
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary" />
                    </button>
                </div>
                <div className="animate-fade-in">
                    <div className="bg-card dark:bg-dark-card p-8 rounded-xl shadow-lg flex flex-col sm:flex-row items-center gap-6">
                        <span className="text-8xl" role="img">{crop.emoji}</span>
                        <div className="text-center sm:text-left">
                            <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{t('cropAdvisor.details.title', { crop: cropName })}</h1>
                            <p className="text-text-secondary dark:text-dark-text-secondary mt-1">{t(`cropDetails.${crop.key}.description`)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-md">
                            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('cropAdvisor.details.detailsTitle')}</h2>
                            <div className="space-y-4">
                                {detailSections.slice(1).map(section => (
                                    <div key={section.titleKey}>
                                        <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">{t(section.titleKey)}</h3>
                                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">{t(section.contentKey)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-md">
                            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2"><CalendarDaysIcon className="w-6 h-6" />{t('cropAdvisor.details.calendarTitle')}</h2>
                            <ul className="space-y-3">
                                {calendarTasks.map((task, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="w-16 text-right mr-4 flex-shrink-0"><p className="font-bold text-primary text-sm">{t('cropAdvisor.details.dayLabel', { day: task.day })}</p></div>
                                        <div className="border-l-2 border-border dark:border-dark-border pl-4"><p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary -mt-1">{t(`calendarTasks.${task.taskKey}`)}</p></div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        {!viewPlanKey && (
                            <button onClick={handleSavePlan} disabled={isSaved} className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:bg-green-300 dark:disabled:bg-green-800 flex items-center justify-center gap-2">
                                {isSaved ? ( <><CheckCircleIcon className="w-5 h-5" /> {t('cropAdvisor.details.planSavedButton')}</> ) : ( t('cropAdvisor.details.savePlanButton') )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
         </div>
      )
  };

  switch (step) {
    case 'loading': return renderLoading();
    case 'result': return renderResult();
    case 'details': return renderDetails();
    case 'form': default: return renderForm();
  }
};