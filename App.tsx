import React, { useState, useEffect, useRef } from 'react';
import { Page, Alert, RiskLevel, Device, DeviceStatus } from './types';
import { useSimulatedData } from './hooks/useSimulatedData';
import { Dashboard } from './components/Dashboard';
import { SpectralAnalysis } from './components/SpectralAnalysis';
import { Chatbot } from './components/Chatbot';
import { LoginPage } from './components/LoginPage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { SettingsPage } from './components/SettingsPage';
import { DeviceSetupGuide } from './components/DeviceSetupGuide';
// FIX: Added missing LogoutIcon to imports.
import { CogIcon, LogoIcon, SubscriptionIcon, UserIcon, CloseIcon, ChatIcon, Tooltip, BellIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon, WifiIcon, CameraIcon, ScaleIcon, UsersIcon, UserCircleIcon, LogoutIcon } from './components/shared/IconComponents';
import { useI18n } from './contexts/I18nContext';
import { BottomNavBar } from './components/BottomNavBar';
import { DeviceManagementPage } from './components/DeviceManagementPage';
import { CropAdvisor } from './components/CropAdvisor';
import { MarketPrices } from './components/MarketPrices';
import { CommunityPage } from './components/CommunityPage';
import { ProfilePage } from './components/ProfilePage';
import { fetchWeatherForLocation } from './services/weatherService';

const riskToastMap: { [key in RiskLevel]: { icon: React.ReactNode; classes: string } } = {
  [RiskLevel.Low]: { icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />, classes: 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700' },
  [RiskLevel.Medium]: { icon: <InformationCircleIcon className="w-6 h-6 text-yellow-500" />, classes: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-700' },
  [RiskLevel.High]: { icon: <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />, classes: 'bg-orange-50 dark:bg-orange-900/50 border-orange-200 dark:border-orange-700' },
  [RiskLevel.Critical]: { icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />, classes: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-700' },
};

const Toast: React.FC<{ alert: Alert, onClose: () => void }> = ({ alert, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onClose, 500); // Wait for fade-out animation
        }, 7000); // Auto-dismiss after 7 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 500);
    };

    const { icon, classes } = riskToastMap[alert.riskLevel];

    return (
        <div className={`fixed top-6 right-6 w-full max-w-sm p-4 rounded-xl shadow-2xl border flex items-start gap-3 z-[100] ${classes} ${isExiting ? 'animate-fadeOut' : 'animate-slideInRight'}`}>
            <div className="flex-shrink-0">{icon}</div>
            <div className="flex-grow">
                <p className="font-bold text-text-primary dark:text-dark-text-primary">{alert.title}</p>
                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">{alert.description}</p>
            </div>
            <button onClick={handleClose} className="p-1 rounded-full text-text-secondary hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0">
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
    );
};


interface HeaderProps {
    onNavClick: (page: Page) => void;
    onLogout: () => void;
    alerts: Alert[];
    connectedSensorCount: number;
    connectedCameraCount: number;
}

const Header: React.FC<HeaderProps> = ({ onNavClick, onLogout, alerts, connectedSensorCount, connectedCameraCount }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const { t } = useI18n();

    const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

    const totalDeviceCount = connectedSensorCount + connectedCameraCount;
    const isAnyDeviceConnected = totalDeviceCount > 0;

    const deviceTooltipText = isAnyDeviceConnected
        ? t('tooltips.deviceStatusConnected', { sensorCount: connectedSensorCount, cameraCount: connectedCameraCount })
        : t('tooltips.deviceStatusDisconnected');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNav = (page: Page) => {
        onNavClick(page);
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
    }
    
    return (
        <header className="bg-card dark:bg-dark-card shadow-md px-4 sm:px-6 py-2 flex justify-between items-center z-20">
            <div className="flex items-center cursor-pointer" onClick={() => onNavClick(Page.Home)}>
                <LogoIcon className="w-12 h-12"/>
                <span className="ml-2 text-xl font-bold text-text-primary dark:text-dark-text-primary hidden sm:inline">SARVANAM</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                 <Tooltip text={t('tooltips.spectralAnalysis')} position="bottom">
                    <button
                        onClick={() => handleNav(Page.SpectralAnalysis)}
                        className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center relative transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                        aria-label={t('tooltips.spectralAnalysis')}
                    >
                        <CameraIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary" />
                    </button>
                </Tooltip>
                <Tooltip text={deviceTooltipText} position="bottom">
                    <button
                        onClick={() => onNavClick(Page.DeviceManagement)}
                        className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center relative transition-colors hover:bg-slate-300 dark:hover:bg-slate-600"
                        aria-label={deviceTooltipText}
                    >
                        <WifiIcon className={`w-6 h-6 ${isAnyDeviceConnected ? 'text-primary' : 'text-text-secondary dark:text-dark-text-secondary'}`} />
                        {isAnyDeviceConnected && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-xs font-bold border-2 border-card dark:border-dark-card">
                                {totalDeviceCount}
                            </span>
                        )}
                    </button>
                </Tooltip>
                 {/* Notifications Bell */}
                <div className="relative" ref={notificationsRef}>
                     <Tooltip text={t('tooltips.notifications')} position="bottom">
                        <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center relative">
                            <BellIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary"/>
                             {unacknowledgedAlerts.length > 0 && (
                                <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 border-2 border-card dark:border-dark-card"></span>
                             )}
                        </button>
                    </Tooltip>
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border py-2">
                             <div className="px-4 py-2 border-b border-border dark:border-dark-border">
                                <h3 className="font-bold text-text-primary dark:text-dark-text-primary">{t('header.notifications.title')}</h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                               {unacknowledgedAlerts.length > 0 ? (
                                   unacknowledgedAlerts.slice(0, 5).map(alert => (
                                       <div key={alert.id} className="px-4 py-3 hover:bg-background dark:hover:bg-dark-background border-b border-border dark:border-dark-border">
                                           <p className="font-semibold text-sm text-text-primary dark:text-dark-text-primary">{alert.title}</p>
                                           <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{alert.description}</p>
                                           <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{alert.timestamp}</p>
                                       </div>
                                   ))
                               ) : (
                                   <p className="text-center text-sm text-text-secondary dark:text-dark-text-secondary py-4">{t('header.notifications.none')}</p>
                               )}
                            </div>
                            <div className="pt-2 mt-2 border-t border-border dark:border-dark-border">
                                <button onClick={() => handleNav(Page.Home)} className="block text-center w-full px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-md">
                                    {t('header.notifications.viewAll')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main User Menu */}
                <div className="relative" ref={menuRef}>
                    <Tooltip text={t('tooltips.userMenu')} position="bottom">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary"/>
                        </button>
                    </Tooltip>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border py-2">
                            <div className="px-4 py-3 border-b border-border dark:border-dark-border">
                                <p className="font-semibold text-text-primary dark:text-dark-text-primary">Demo Farmer</p>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">demo.farmer@sarvanam.ai</p>
                            </div>
                            <div className="py-1">
                                <button onClick={() => handleNav(Page.Profile)} className="w-full text-left flex items-center px-4 py-2 text-text-primary dark:text-dark-text-primary hover:bg-background dark:hover:bg-dark-background cursor-pointer">
                                    <UserCircleIcon className="w-5 h-5 mr-3" />
                                    <span>{t('header.menu.profile')}</span>
                                </button>
                                <button onClick={() => handleNav(Page.Subscription)} className="w-full text-left flex items-center px-4 py-2 text-text-primary dark:text-dark-text-primary hover:bg-background dark:hover:bg-dark-background cursor-pointer">
                                    <SubscriptionIcon className="w-5 h-5 mr-3" />
                                    <span>{t('header.menu.subscription')}</span>
                                </button>
                                <button onClick={() => handleNav(Page.Settings)} className="w-full text-left flex items-center px-4 py-2 text-text-primary dark:text-dark-text-primary hover:bg-background dark:hover:bg-dark-background cursor-pointer">
                                    <CogIcon className="w-5 h-5 mr-3" />
                                    <span>{t('header.menu.settings')}</span>
                                </button>
                            </div>
                            <div className="py-1 border-t border-border dark:border-dark-border">
                                <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 cursor-pointer">
                                    <LogoutIcon className="w-5 h-5 mr-3"/>
                                    <span>{t('header.menu.logout')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const ChatOverlay: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { t } = useI18n();
    return (
        <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center p-4 lg:p-0 lg:items-end lg:justify-end" onClick={onClose}>
             <div 
                className="w-full h-full max-w-lg lg:h-[70vh] lg:max-h-[600px] lg:w-96 bg-card dark:bg-dark-card rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slideInRight lg:mr-6 lg:mb-24"
                onClick={(e) => e.stopPropagation()}
             >
                <div className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border flex-shrink-0">
                    <h2 className="font-bold text-lg text-text-primary dark:text-dark-text-primary">{t('chatbot.title')}</h2>
                    <Tooltip text={t('chatbot.close')} position="bottom">
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                            <CloseIcon className="w-5 h-5"/>
                        </button>
                    </Tooltip>
                </div>
                <Chatbot />
            </div>
        </div>
    );
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [planToView, setPlanToView] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [hasSubscription, setHasSubscription] = useState(false);
  const [historyStack, setHistoryStack] = useState<Page[]>([]);

  const [viewMode, setViewMode] = useState<'basic' | 'pro'>(() => {
    const savedViewMode = localStorage.getItem('viewMode');
    return (savedViewMode === 'basic' || savedViewMode === 'pro') ? savedViewMode : 'basic';
  });

  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    sensors: [{ id: 's1', name: 'Main Soil Sensor', connected: true }],
    cameras: [{ id: 'c1', name: 'Crop Cam 1', connected: true }],
  });
  const [userLocationName, setUserLocationName] = useState<string>(() => localStorage.getItem('userLocationName') || 'Coimbatore, Tamil Nadu');

  const { isInitialLoading, sensorData, weatherData, farmZones, alerts, historicalData, acknowledgeAlert } = useSimulatedData();
  const [liveWeather, setLiveWeather] = useState<WeatherData | null>(null);
  const [toasts, setToasts] = useState<Alert[]>([]);
  const shownAlerts = useRef(new Set<number>());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useI18n();
  
  const connectedSensors = deviceStatus.sensors.filter(d => d.connected);
  const connectedCameras = deviceStatus.cameras.filter(d => d.connected);
  const isAnySensorConnected = connectedSensors.length > 0;
  
  const effectiveViewMode = hasSubscription ? viewMode : 'basic';
  const isAnalysisEnabled = effectiveViewMode === 'basic' || (effectiveViewMode === 'pro' && connectedCameras.length > 0);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  // Load saved location on mount / login change
  useEffect(() => {
    const saved = localStorage.getItem('userLocationName');
    if (saved && saved !== userLocationName) setUserLocationName(saved);
  }, [isAuthenticated]);

  // Fetch live weather when location changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!userLocationName) return;
        const w = await fetchWeatherForLocation(userLocationName);
        if (!cancelled) setLiveWeather(w);
      } catch (e) {
        console.warn('Weather fetch failed, using simulated data fallback');
        if (!cancelled) setLiveWeather(null);
      }
    })();
    return () => { cancelled = true; };
  }, [userLocationName]);
  
  useEffect(() => {
    if (!hasSubscription && viewMode === 'pro') {
      setViewMode('basic');
    }
  }, [hasSubscription, viewMode]);

  useEffect(() => {
    const newActiveAlerts = alerts.filter(a => !a.acknowledged && !shownAlerts.current.has(a.id));
    if (newActiveAlerts.length > 0) {
        setToasts(prevToasts => [...prevToasts, ...newActiveAlerts]);
        newActiveAlerts.forEach(a => shownAlerts.current.add(a.id));
    }
  }, [alerts]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage(Page.Home);
    const saved = localStorage.getItem('userLocationName');
    if (saved) setUserLocationName(saved);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage(Page.Home);
  };

  const handleNavClick = (page: Page) => {
    if(page === Page.CropAdvisor && planToView) {
        setPlanToView(null);
    }
    setHistoryStack(prev => (currentPage !== page ? [...prev, currentPage] : prev));
    setCurrentPage(page);
  };

  const handleBack = () => {
    setHistoryStack(prev => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const last = newStack.pop() as Page;
      setCurrentPage(last);
      return newStack;
    });
  };

  const handleHome = () => {
    setHistoryStack([]);
    setCurrentPage(Page.Home);
  };

  const handleViewPlan = (cropKey: string) => {
      setPlanToView(cropKey);
      setCurrentPage(Page.CropAdvisor);
  };

  const handleAskByVoice = () => {
    setIsChatOpen(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.SpectralAnalysis:
        return <SpectralAnalysis onNavClick={handleNavClick} viewMode={effectiveViewMode} isDeviceConnected={connectedCameras.length > 0} isAnalysisEnabled={isAnalysisEnabled} connectedCameras={connectedCameras}/>;
      case Page.Subscription:
        return <SubscriptionPage onNavClick={handleNavClick} hasSubscription={hasSubscription} onUpgrade={() => setHasSubscription(true)} />;
       case Page.Settings:
        return <SettingsPage theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} onNavClick={handleNavClick} viewMode={viewMode} onSetViewMode={setViewMode} hasSubscription={hasSubscription} onSetHasSubscription={setHasSubscription} />;
      case Page.DeviceSetup:
        return <DeviceSetupGuide onNavClick={handleNavClick}/>;
      case Page.DeviceManagement:
        return <DeviceManagementPage deviceStatus={deviceStatus} onSetDeviceStatus={setDeviceStatus} onNavClick={handleNavClick} hasSubscription={hasSubscription}/>
      case Page.CropAdvisor:
        return <CropAdvisor sensorData={sensorData} weatherData={weatherData} onNavClick={handleNavClick} viewPlanKey={planToView} onClearViewPlan={() => setPlanToView(null)} />;
      case Page.MarketPrices:
        return <MarketPrices onNavClick={handleNavClick}/>;
      case Page.Community:
        return <CommunityPage onNavClick={handleNavClick}/>;
      case Page.Profile:
        return <ProfilePage onNavClick={handleNavClick}/>;
      case Page.Home:
      default:
        return <Dashboard 
                  sensorData={sensorData} 
                  weatherData={liveWeather || weatherData} 
                  farmZones={farmZones} 
                  alerts={alerts} 
                  historicalData={historicalData} 
                  viewMode={effectiveViewMode} 
                  locationName={userLocationName}
                  isSensorConnected={isAnySensorConnected}
                  connectedCameras={connectedCameras}
                  isInitialLoading={isInitialLoading}
                  onNavClick={handleNavClick}
                  onAcknowledgeAlert={acknowledgeAlert}
                  onViewPlan={handleViewPlan}
                  onAskByVoice={handleAskByVoice}
                />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {toasts.map(toast => (
          <Toast key={toast.id} alert={toast} onClose={() => setToasts(t => t.filter(item => item.id !== toast.id))} />
      ))}
      {isAuthenticated && <Header onNavClick={handleNavClick} onLogout={handleLogout} alerts={alerts} connectedSensorCount={connectedSensors.length} connectedCameraCount={connectedCameras.length} />}
      <main className="flex-grow overflow-y-auto pb-24">
         {isOffline && (
            <div className="bg-yellow-500 text-center text-white p-2 font-semibold">
                You are currently offline. Some features may be unavailable.
            </div>
        )}
        {renderPage()}
      </main>

      {isAuthenticated && (
        <>
          <div className="fixed bottom-32 right-6 z-40 lg:bottom-10">
              <Tooltip text={t('tooltips.openChat')} position="left">
                  <button
                      onClick={() => setIsChatOpen(true)}
                      className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-transform hover:scale-110"
                      aria-label={t('chatbot.open')}
                  >
                      <ChatIcon className="w-8 h-8"/>
                  </button>
              </Tooltip>
          </div>

          {isChatOpen && <ChatOverlay onClose={() => setIsChatOpen(false)} />}
          
          <BottomNavBar 
            viewMode={viewMode} 
            onSetViewMode={setViewMode} 
            hasSubscription={hasSubscription}
            onBack={handleBack}
            onHome={handleHome}
            canGoBack={historyStack.length > 0}
          />
        </>
      )}

    </div>
  );
}

export default App;