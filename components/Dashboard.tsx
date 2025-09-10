import React from 'react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { SensorData, WeatherData, FarmZone, Alert, RiskLevel, Page, Device } from '../types';
import { SunIcon, CloudIcon, LocationMarkerIcon, CalendarDaysIcon, LightBulbIcon, CloseIcon, SignalIcon, MapIcon, BeakerIcon, TrendingUpIcon, TrashIcon, CpuChipIcon, Tooltip, CameraIcon, VideoCameraIcon, ChevronLeftIcon, ChevronRightIcon, SparklesIcon, EyeIcon, UsersIcon, ScaleIcon } from './shared/IconComponents';
import { Card } from './shared/Card';
import { useI18n } from '../contexts/I18nContext';

interface DashboardProps {
  sensorData: SensorData;
  weatherData: WeatherData;
  farmZones: FarmZone[];
  alerts: Alert[];
  historicalData: SensorData[];
  viewMode: 'basic' | 'pro';
  locationName: string;
  isSensorConnected: boolean;
  connectedCameras: Device[];
  isInitialLoading: boolean;
  onNavClick: (page: Page) => void;
  onAcknowledgeAlert: (id: number) => void;
  onViewPlan: (cropKey: string) => void;
  onAskByVoice: () => void;
}

const riskColorMap: { [key in RiskLevel]: string } = {
  [RiskLevel.Low]: 'bg-green-100 text-green-800 border-green-400 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
  [RiskLevel.Medium]: 'bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
  [RiskLevel.High]: 'bg-orange-100 text-orange-800 border-orange-400 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700',
  [RiskLevel.Critical]: 'bg-red-100 text-red-800 border-red-400 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
};

const riskBgColorMap: { [key in RiskLevel]: string } = {
  [RiskLevel.Low]: 'bg-green-500',
  [RiskLevel.Medium]: 'bg-yellow-500',
  [RiskLevel.High]: 'bg-orange-500',
  [RiskLevel.Critical]: 'bg-red-600',
};

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-card dark:bg-dark-card rounded-xl shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            </div>
        </div>
    </div>
);


const WeatherWidget: React.FC<{ data: WeatherData, locationName: string, className?: string }> = ({ data, locationName, className }) => {
    const { t } = useI18n();

    const forecastData = [
        { dayKey: 'mon', condition: 'Sunny', high: 26, low: 18 },
        { dayKey: 'tue', condition: 'Cloudy', high: 24, low: 17 },
        { dayKey: 'wed', condition: 'Sunny', high: 27, low: 19 },
    ];

    const getWeatherIcon = (condition: string, className: string) => {
        const iconClass = `${className} ${condition === 'Sunny' ? 'text-yellow-400' : 'text-slate-400'}`;
        switch(condition) {
            case 'Sunny':
                return <SunIcon className={iconClass} />;
            case 'Cloudy':
            case 'Rainy':
            case 'Stormy':
                return <CloudIcon className={iconClass} />;
            default:
                return <CloudIcon className={iconClass} />;
        }
    }

    return (
        <Card title={t('dashboard.weather.title')} className={className}>
            {/* Current Weather Section */}
            <div className="flex items-center text-sm text-text-secondary dark:text-dark-text-secondary -mt-3 mb-3">
                <LocationMarkerIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate" title={locationName}>{locationName}</span>
            </div>
            <div className="flex items-center justify-around text-center mb-4">
                <div>
                    {getWeatherIcon(data.condition, "w-16 h-16 mx-auto")}
                    <p className="text-lg font-semibold text-text-secondary dark:text-dark-text-secondary mt-2">{data.condition}</p>
                </div>
                <div className="text-left">
                    <p className="text-4xl font-bold text-text-primary dark:text-dark-text-primary">{data.temperature.toFixed(0)}°C</p>
                    <p className="text-md text-text-secondary dark:text-dark-text-secondary">{t('dashboard.weather.humidity')}: {data.humidity}%</p>
                    <p className="text-md text-text-secondary dark:text-dark-text-secondary">{t('dashboard.weather.wind')}: {data.windSpeed.toFixed(0)} km/h</p>
                </div>
            </div>

            {/* Divider */}
            <hr className="border-border dark:border-dark-border my-4" />

            {/* 3-Day Forecast Section */}
            <div>
                <h3 className="text-md font-bold text-text-primary dark:text-dark-text-primary mb-3 text-center">{t('dashboard.weather.forecastTitle')}</h3>
                <div className="flex justify-around text-center">
                    {forecastData.map((forecast) => (
                        <div key={forecast.dayKey} className="flex flex-col items-center space-y-1">
                            <p className="font-bold text-text-secondary dark:text-dark-text-secondary text-sm">{t(`dashboard.weather.days.${forecast.dayKey}`)}</p>
                            {getWeatherIcon(forecast.condition, "w-10 h-10")}
                            <div className="flex items-baseline gap-1">
                                <p className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">{forecast.high}°</p>
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{forecast.low}°</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

const SensorDataWidget: React.FC<{ data: SensorData; className?: string }> = ({ data, className }) => {
    const { t } = useI18n();
    const sensorOrder: (keyof SensorData)[] = ['soilMoisture', 'temperature', 'humidity', 'nitrogen', 'phosphorus', 'potassium', 'ph', 'fertility'];

    return (
        <Card title={t('dashboard.sensors.title')} className={className}>
            <div className="flex items-center text-xs text-text-secondary dark:text-dark-text-secondary -mt-3 mb-3">
                <CpuChipIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>{t('dashboard.sensors.dataSource')}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {sensorOrder.map((key) => {
                const value = data[key];
                const labels: {[key: string]: string} = {
                    soilMoisture: t('dashboard.sensors.soilMoisture'),
                    temperature: t('dashboard.sensors.temperature'),
                    humidity: t('dashboard.sensors.airHumidity'),
                    nitrogen: t('dashboard.sensors.nitrogen'),
                    phosphorus: t('dashboard.sensors.phosphorus'),
                    potassium: t('dashboard.sensors.potassium'),
                    ph: t('dashboard.sensors.ph'),
                    fertility: t('dashboard.sensors.fertility'),
                }
                return (
                <div key={key} className="text-sm">
                    <p className="text-text-secondary dark:text-dark-text-secondary">{labels[key]}</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
                        {key === 'fertility' ? t(`dashboard.sensors.fertilityLevels.${value as string}`) : typeof value === 'number' ? value.toFixed(1) : value}
                    </p>
                </div>
                )
            })}
            </div>
        </Card>
    );
};

const AlertsWidget: React.FC<{ alerts: Alert[], className?: string, onAcknowledgeAlert: (id: number) => void; }> = ({ alerts, className, onAcknowledgeAlert }) => {
    const { t } = useI18n();
    const activeAlerts = alerts.filter(a => !a.acknowledged);
    const acknowledgedAlerts = alerts.filter(a => a.acknowledged);

    return (
        <Card title={t('dashboard.alerts.title')} className={className}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeAlerts.length === 0 && <p className="text-text-secondary dark:text-dark-text-secondary text-center py-4">{t('dashboard.alerts.noActiveAlerts')}</p>}
                {activeAlerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${riskColorMap[alert.riskLevel]}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">{alert.title}</p>
                            </div>
                            <button 
                                onClick={() => onAcknowledgeAlert(alert.id)}
                                className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 transition-colors flex-shrink-0 ml-2"
                            >
                                {t('dashboard.alerts.acknowledge')}
                            </button>
                        </div>
                        <p className="text-sm mt-1">{alert.description}</p>
                        <p className="text-xs text-right mt-1">{alert.timestamp}</p>
                    </div>
                ))}
                
                {acknowledgedAlerts.length > 0 && (
                    <>
                        <hr className="border-border dark:border-dark-border my-4" />
                        <h3 className="text-sm font-bold text-text-secondary dark:text-dark-text-secondary mb-2">{t('dashboard.alerts.acknowledgedTitle')}</h3>
                        <div className="space-y-3">
                        {acknowledgedAlerts.map(alert => (
                            <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${riskColorMap[alert.riskLevel]} opacity-60`}>
                                <div className="flex justify-between items-center">
                                    <p className="font-bold">{alert.title}</p>
                                    <p className="text-xs">{alert.timestamp}</p>
                                </div>
                                <p className="text-sm">{alert.description}</p>
                            </div>
                        ))}
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
};

const RiskMapWidget: React.FC<{ zones: FarmZone[], className?: string }> = ({ zones, className }) => {
    const { t } = useI18n();
    return (
        <Card title={t('dashboard.riskMap.title')} className={className}>
        {zones.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 aspect-square">
                {zones.map(zone => (
                <div key={zone.id} title={zone.details} className={`flex items-center justify-center rounded-md text-white text-xs font-bold transition-transform hover:scale-110 cursor-pointer ${riskBgColorMap[zone.riskLevel]}`}>
                    {t('dashboard.riskMap.zone')} {zone.id + 1}
                </div>
                ))}
            </div>
        ) : (
            <div className="flex items-center justify-center h-full min-h-[150px] aspect-square text-center text-text-secondary dark:text-dark-text-secondary">
                <p>{t('dashboard.riskMap.emptyState')}</p>
            </div>
        )}
        </Card>
    );
};

const SoilNutrientsWidget: React.FC<{data: SensorData, className?: string}> = ({ data, className }) => {
    const { t } = useI18n();
    const chartData = [
        { name: 'N', value: data.nitrogen, fill: '#8884d8' },
        { name: 'P', value: data.phosphorus, fill: '#82ca9d' },
        { name: 'K', value: data.potassium, fill: '#ffc658' },
    ];
    return (
        <Card title={t('dashboard.nutrients.title')} className={className}>
             <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke={'#475569'}/>
                    <YAxis stroke={'#475569'}/>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'black', opacity: 0.8 }}/>
                    <Bar dataKey="value" fill="fill" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    )
}

const HistoricalDataWidget: React.FC<{ data: SensorData[], className?: string }> = ({ data, className }) => {
    const { t } = useI18n();
    return (
        <Card title={t('dashboard.historicalTrends.title')} className={className}>
            <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tickFormatter={(v, i) => `${i+1}`} stroke={'#475569'}/>
                <YAxis stroke={'#475569'}/>
                <RechartsTooltip contentStyle={{ backgroundColor: 'black', opacity: 0.8 }}/>
                <Legend />
                <Line type="monotone" dataKey="soilMoisture" name={t('dashboard.historicalTrends.moisture')} stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="humidity" name={t('dashboard.historicalTrends.humidity')} stroke="#82ca9d" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ph" name={t('dashboard.sensors.ph')} stroke="#ffc658" strokeWidth={2} dot={false} />
            </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

const LiveMonitoringWidget: React.FC<{ cameras: Device[]; onNavClick: (page: Page) => void; className?: string }> = ({ cameras, onNavClick, className }) => {
    const { t } = useI18n();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex(prev => (prev === 0 ? cameras.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => (prev === cameras.length - 1 ? 0 : prev + 1));
    };

    if (cameras.length === 0) {
        return (
            <div className={`bg-card dark:bg-dark-card rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center ${className}`}>
                <VideoCameraIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-3"/>
                <h3 className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{t('dashboard.monitoring.noCameras.title')}</h3>
                <p className="text-text-secondary dark:text-dark-text-secondary mt-1 max-w-xs mx-auto">{t('dashboard.monitoring.noCameras.description')}</p>
                <button 
                    onClick={() => onNavClick(Page.DeviceManagement)} 
                    className="mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    {t('dashboard.monitoring.noCameras.button')}
                </button>
            </div>
        );
    }

    const currentCamera = cameras[currentIndex];

    return (
        <Card title={t('dashboard.monitoring.title')} className={className}>
            <div className="relative aspect-video bg-slate-900 rounded-lg flex items-center justify-center text-slate-400 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30" 
                    style={{ backgroundImage: `url('https://storage.googleapis.com/maker-studio-project-media-prod/media/20240711130311_354_farm_view.png')` }}
                ></div>
                <VideoCameraIcon className="w-24 h-24 text-slate-600 z-10"/>
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">
                    {t('dashboard.monitoring.liveFeed', { cameraName: currentCamera.name })}
                </div>
            </div>
            <div className="flex items-center justify-between mt-4">
                <Tooltip text={t('tooltips.previousCamera')}>
                    <button 
                        onClick={handlePrev} 
                        disabled={cameras.length <= 1}
                        className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                        <ChevronLeftIcon className="w-5 h-5"/>
                    </button>
                </Tooltip>
                <p className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
                    {t('dashboard.monitoring.camera')} {currentIndex + 1}/{cameras.length}: <span className="text-text-primary dark:text-dark-text-primary">{currentCamera.name}</span>
                </p>
                <Tooltip text={t('tooltips.nextCamera')}>
                     <button 
                        onClick={handleNext} 
                        disabled={cameras.length <= 1}
                        className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                        <ChevronRightIcon className="w-5 h-5"/>
                    </button>
                </Tooltip>
            </div>
        </Card>
    );
};

const FarmHistoryWidget: React.FC<{className?: string}> = ({className}) => {
    const {t} = useI18n();
    return (
        <Card title={t('dashboard.history.title')} className={className}>
            <div className="space-y-4">
                <div>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{t('dashboard.history.lastCrop')}</p>
                    <p className="text-lg font-bold text-text-primary dark:text-dark-text-primary">Wheat</p>
                </div>
                <div>
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{t('dashboard.history.recoveryStatus')}</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-1">
                        <div className="bg-primary h-2.5 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <p className="text-right text-xs font-semibold text-text-secondary dark:text-dark-text-secondary mt-1">75%</p>
                </div>
            </div>
        </Card>
    )
}

const SustainabilityTrackerWidget: React.FC<{className?: string}> = ({className}) => {
    const {t} = useI18n();
    const stats = [
        { label: t('dashboard.sustainability.waterSaved'), value: '1,200 L' },
        { label: t('dashboard.sustainability.carbonReduced'), value: '5 kg CO₂' },
        { label: t('dashboard.sustainability.soilImproved'), value: '+5%' },
    ];
    return (
        <Card title={t('dashboard.sustainability.title')} className={className}>
            <div className="flex justify-around text-center">
                {stats.map(stat => (
                    <div key={stat.label}>
                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>
        </Card>
    )
}

const CropAdvisorCard: React.FC<{ onNavClick: (page: Page) => void; className?: string }> = ({ onNavClick, className }) => {
    const { t } = useI18n();
    return (
        <div className={`bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/50 dark:to-blue-900/50 p-6 rounded-xl shadow-md flex flex-col items-center text-center ${className}`}>
            <SparklesIcon className="w-12 h-12 text-primary mb-3" />
            <h3 className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{t('dashboard.cropAdvisorCard.title')}</h3>
            <p className="text-text-secondary dark:text-dark-text-secondary text-sm mt-1 max-w-xs mx-auto">{t('dashboard.cropAdvisorCard.description')}</p>
            <button 
                onClick={() => onNavClick(Page.CropAdvisor)} 
                className="mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                {t('dashboard.cropAdvisorCard.button')}
            </button>
        </div>
    );
};

interface CalendarPlan {
    cropKey: string;
    tasks: { day: string; taskKey: string }[];
}

const PersonalizedCalendarWidget: React.FC<{
    onViewPlan: (cropKey: string) => void;
    className?: string;
}> = ({ onViewPlan, className }) => {
    const { t } = useI18n();
    const [savedCalendars, setSavedCalendars] = useState<Record<string, CalendarPlan>>({});
    const [planToDelete, setPlanToDelete] = useState<CalendarPlan | null>(null);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem('savedFarmingCalendars');
            if (savedData) setSavedCalendars(JSON.parse(savedData));
        } catch (e) { console.error("Failed to load calendars", e); }
    }, []);

    const handleDelete = () => {
        if (!planToDelete) return;
        try {
            const updatedCalendars = { ...savedCalendars };
            delete updatedCalendars[planToDelete.cropKey];
            localStorage.setItem('savedFarmingCalendars', JSON.stringify(updatedCalendars));
            setSavedCalendars(updatedCalendars);
            setPlanToDelete(null);
        } catch (e) { console.error("Failed to delete calendar", e); }
    };

    const calendarList = Object.values(savedCalendars);

    return (
        <Card title={t('dashboard.calendar.savedCalendarsTitle')} className={className}>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {calendarList.length > 0 ? (
                    calendarList.map(plan => (
                        <div key={plan.cropKey} className="flex items-center justify-between p-3 rounded-lg bg-background dark:bg-dark-background">
                            <p className="font-semibold text-text-primary dark:text-dark-text-primary">{t(`dashboard.suggestions.crops.${plan.cropKey}`)}</p>
                            <div className="flex items-center gap-2">
                                <Tooltip text={t('tooltips.viewPlan')}>
                                    <button onClick={() => onViewPlan(plan.cropKey)} className="p-2 text-primary hover:bg-primary/10 rounded-full"><EyeIcon className="w-5 h-5"/></button>
                                </Tooltip>
                                <Tooltip text={t('tooltips.deleteCalendar')}>
                                    <button onClick={() => setPlanToDelete(plan)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                </Tooltip>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-sm text-text-secondary dark:text-dark-text-secondary py-4">{t('dashboard.calendar.noSavedCalendars')}</p>
                )}
            </div>

            {planToDelete && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
                    <div className="bg-card dark:bg-dark-card rounded-xl shadow-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold">{t('dashboard.calendar.deleteConfirm.title')}</h3>
                        <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                            {t('dashboard.calendar.deleteConfirm.message', { crop: t(`dashboard.suggestions.crops.${planToDelete.cropKey}`) })}
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setPlanToDelete(null)} className="px-4 py-2 rounded-lg font-semibold bg-slate-200 dark:bg-slate-600">{t('dashboard.calendar.deleteConfirm.cancelButton')}</button>
                            <button onClick={handleDelete} className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white">{t('dashboard.calendar.deleteConfirm.confirmButton')}</button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const MarketPricesWidget: React.FC<{ onNavClick: (page: Page) => void, className?: string }> = ({ onNavClick, className }) => {
    const { t } = useI18n();
    const mandiData = [
        { cropKey: 'wheat', price: 2150, change: 2.4 },
        { cropKey: 'onion', price: 2200, change: 18.9 },
        { cropKey: 'tomatoes', price: 2700, change: -1.8 },
    ];
    return (
        <Card title={t('dashboard.marketWidget.title')} className={className}>
            <div className="space-y-3">
                {mandiData.map(item => (
                    <div key={item.cropKey} className="flex justify-between items-center p-2 rounded-lg bg-background dark:bg-dark-background">
                        <p className="font-semibold text-text-primary dark:text-dark-text-primary text-sm">{t(`dashboard.suggestions.crops.${item.cropKey}`)}</p>
                        <div className="text-right">
                            <p className="font-bold text-sm">₹{item.price}/qtl</p>
                            <p className={`text-xs font-semibold ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {item.change >= 0 ? '▲' : '▼'} {item.change}%
                            </p>
                        </div>
                    </div>
                ))}
            </div>
             <button 
                onClick={() => onNavClick(Page.MarketPrices)}
                className="mt-4 w-full text-sm font-semibold text-primary hover:text-primary-dark"
             >
                {t('dashboard.marketWidget.viewAll')}
            </button>
        </Card>
    );
}

const CommunityWidget: React.FC<{ onNavClick: (page: Page) => void, className?: string }> = ({ onNavClick, className }) => {
    const { t } = useI18n();
    return (
        <Card title={t('dashboard.communityWidget.title')} className={className}>
            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-sm text-text-secondary dark:text-dark-text-secondary mb-2">{t('dashboard.communityWidget.videos')}</h3>
                    <a href="#" className="block p-2 rounded-lg hover:bg-background dark:hover:bg-dark-background text-sm font-semibold text-primary">
                      {t('community.videos.video1.title')}
                    </a>
                </div>
                 <div>
                    <h3 className="font-semibold text-sm text-text-secondary dark:text-dark-text-secondary mb-2">{t('dashboard.communityWidget.stories')}</h3>
                     <div className="p-2 rounded-lg bg-background dark:bg-dark-background">
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">"{t('community.successStories.story1.quote')}"</p>
                        <p className="text-xs font-semibold text-right mt-1">- {t('community.successStories.story1.author')}</p>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => onNavClick(Page.Community)}
                className="mt-4 w-full text-sm font-semibold text-primary hover:text-primary-dark"
             >
                {t('dashboard.communityWidget.viewAll')}
            </button>
        </Card>
    )
}

export const Dashboard: React.FC<DashboardProps> = ({ sensorData, weatherData, farmZones, alerts, historicalData, viewMode, locationName, isSensorConnected, connectedCameras, isInitialLoading, onNavClick, onAcknowledgeAlert, onViewPlan }) => {
  const { t } = useI18n();

  if (isInitialLoading) {
    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
            <div className="animate-pulse h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard className="md:col-span-2 lg:col-span-3" />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard className="md:col-span-2" />
            </div>
            </div>
        </div>
    );
  }

  if(viewMode === 'basic') {
      return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('dashboard.greeting', { name: 'Farmer' })}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6 lg:col-span-1">
                    <WeatherWidget data={weatherData} locationName={locationName} />
                    <AlertsWidget alerts={alerts} onAcknowledgeAlert={onAcknowledgeAlert} />
                </div>
                <div className="space-y-6 lg:col-span-1">
                    <CropAdvisorCard onNavClick={onNavClick} />
                    <PersonalizedCalendarWidget onViewPlan={onViewPlan} />
                     {isSensorConnected ? (
                        <SensorDataWidget data={sensorData} />
                    ) : (
                        <div className="bg-card dark:bg-dark-card rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                            <CpuChipIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-3"/>
                            <h3 className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{t('dashboard.sensors.title')}</h3>
                            <p className="text-text-secondary dark:text-dark-text-secondary mt-1 max-w-xs mx-auto">{t('dashboard.sensors.connectPrompt')}</p>
                             <button 
                                onClick={() => onNavClick(Page.DeviceSetup)} 
                                className="mt-4 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                {t('dashboard.sensors.connectButton')}
                            </button>
                        </div>
                    )}
                </div>
                <div className="space-y-6 lg:col-span-1">
                   <MarketPricesWidget onNavClick={onNavClick} />
                   <CommunityWidget onNavClick={onNavClick} />
                </div>
                </div>
            </div>
        </div>
      );
  }

  // Pro View
  const isAnyCameraConnected = connectedCameras.length > 0;
  const isAnyDeviceConnected = isSensorConnected || isAnyCameraConnected;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('dashboard.greeting', { name: 'Farmer' })}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAnyDeviceConnected ? (
          <>
            <WeatherWidget data={weatherData} locationName={locationName} className={isSensorConnected ? "col-span-1" : "col-span-1 md:col-span-2"} />
            
            {isSensorConnected && (
              <SensorDataWidget data={sensorData} />
            )}
            
            <AlertsWidget alerts={alerts} onAcknowledgeAlert={onAcknowledgeAlert} className="col-span-1 md:col-span-2" />

            {isAnyCameraConnected && (
              <LiveMonitoringWidget cameras={connectedCameras} onNavClick={onNavClick} className="col-span-1 md:col-span-2 lg:col-span-2" />
            )}

            {isSensorConnected && (
              <>
                <RiskMapWidget zones={farmZones} />
                <SoilNutrientsWidget data={sensorData} />
              </>
            )}

            {!isSensorConnected && isAnyCameraConnected && (
                <>
                    <FarmHistoryWidget className="md:col-span-2"/>
                    <SustainabilityTrackerWidget className="md:col-span-2"/>
                </>
            )}

            {isSensorConnected && (
                 <>
                    <FarmHistoryWidget />
                    <SustainabilityTrackerWidget />
                    <HistoricalDataWidget data={historicalData} className="col-span-1 md:col-span-2 lg:col-span-4" />
                </>
            )}
          </>
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-card dark:bg-dark-card rounded-xl shadow-md p-6 text-center flex flex-col justify-center items-center min-h-[50vh]">
              <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{t('dashboard.proPlaceholder.title')}</h2>
              <p className="max-w-lg mx-auto mt-2 mb-4 text-text-secondary dark:text-dark-text-secondary">{t('dashboard.proPlaceholder.description')}</p>
              <button 
                  onClick={() => onNavClick(Page.DeviceSetup)} 
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-5 rounded-lg transition-colors self-center"
              >
                  {t('dashboard.proPlaceholder.mainButton')}
              </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};