import React, { useState, useEffect } from 'react';
import { LogoIcon, LocationMarkerIcon, EyeIcon, EyeSlashIcon, Tooltip } from './shared/IconComponents';
import { useI18n } from '../contexts/I18nContext';
import { LanguageSelector } from './shared/LanguageSelector';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [location, setLocation] = useState('...');
  const [inputLocation, setInputLocation] = useState('');
  const [locationError, setLocationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (isSignUp) {
      setLocation(t('login.locationDetecting'));
      setLocationError('');

      const locationOptions = {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 0,
      };

      const handleSuccess = (position: GeolocationPosition) => {
          setTimeout(() => setLocation('San Francisco, CA'), 1000); 
          setLocationError('');
      };

      const handleError = (error: GeolocationPositionError) => {
          console.error("Geolocation error:", `Code ${error.code}: ${error.message}`);
          setLocation(t('login.locationCouldNotGet'));
          
          let specificError = t('login.locationError'); // default
          switch (error.code) {
              case 1: // PERMISSION_DENIED is now handled better, but keep for fallback
                  specificError = t('login.locationPermissionDenied');
                  break;
              case 2: // POSITION_UNAVAILABLE
                  specificError = t('login.locationPositionUnavailable');
                  break;
              case 3: // TIMEOUT
                  specificError = t('login.locationTimeout');
                  break;
          }
          setLocationError(specificError);
      };
      
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
          if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError, locationOptions);
          } else {
            // User has denied geolocation. Show an informative message.
            setLocation(t('login.locationCouldNotGet'));
            setLocationError(t('login.locationPermissionDenied'));
          }
        });
      } else {
        // Fallback for browsers that do not support the Permissions API
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, locationOptions);
      }
    } else {
      // Reset location state if user switches away from sign-up form
      setLocation('...');
      setLocationError('');
    }
  }, [isSignUp, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const finalLocation = inputLocation && inputLocation.trim().length > 0 ? inputLocation.trim() : (location && location !== '...' ? location : 'Coimbatore, Tamil Nadu');
      try {
        localStorage.setItem('userLocationName', finalLocation);
      } catch {}
      onLogin();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card dark:bg-dark-card rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center items-center">
            <LogoIcon className="w-24 h-24" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary dark:text-dark-text-primary mt-4">{t('login.title')}</h1>
          <p className="text-text-secondary dark:text-dark-text-secondary mt-1">{t('login.tagline')}</p>
        </div>
        
        <LanguageSelector />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{t('login.emailLabel')}</label>
            <input
              id="email" name="email" type="text" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{t('login.passwordLabel')}</label>
            <div className="relative mt-1">
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder={t('login.passwordPlaceholder')}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <Tooltip text={showPassword ? t('tooltips.hidePassword') : t('tooltips.showPassword')}>
                        <button type="button" aria-label={showPassword ? t('tooltips.hidePassword') : t('tooltips.showPassword')} onClick={() => setShowPassword(!showPassword)} className="p-1 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary focus:outline-none rounded-full">
                            {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </Tooltip>
                </div>
            </div>
          </div>
          {isSignUp && (
            <>
               <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{t('login.confirmPasswordLabel')}</label>
                 <div className="relative mt-1">
                    <input
                      id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder={t('login.passwordPlaceholder')}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <Tooltip text={showConfirmPassword ? t('tooltips.hidePassword') : t('tooltips.showPassword')}>
                            <button type="button" aria-label={showConfirmPassword ? t('tooltips.hidePassword') : t('tooltips.showPassword')} onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1 text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary focus:outline-none rounded-full">
                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                            </button>
                        </Tooltip>
                    </div>
                 </div>
              </div>
              <div>
                <label htmlFor="location" className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{t('login.locationLabel')}</label>
                <div className="relative mt-1">
                    <input
                      id="location" name="location" type="text"
                      value={location} readOnly
                      className="w-full pl-10 pr-3 py-2 text-text-secondary dark:text-dark-text-secondary bg-slate-100 dark:bg-slate-800 border border-border dark:border-dark-border rounded-md"
                    />
                    <LocationMarkerIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-dark-text-secondary"/>
                </div>
                 {locationError && <p className="text-xs text-red-500 mt-1">{locationError}</p>}
              </div>
            </>
          )}
          {/* Manual Location Input (always visible) */}
          <div>
            <label htmlFor="inputLocation" className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{t('Location') || 'Your Location'}</label>
            <div className="relative mt-1">
              <input
                id="inputLocation" name="inputLocation" type="text"
                value={inputLocation}
                onChange={(e) => setInputLocation(e.target.value)}
                placeholder={t('eg. Kolaghat') || 'City, State'}
                className="w-full pl-10 pr-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              />
              <LocationMarkerIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-dark-text-secondary"/>
            </div>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">{t('Location') || 'We use this to show weather and local content.'}</p>
          </div>
          <div>
            <button
              type="submit" disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-green-300 dark:disabled:bg-green-800"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                isSignUp ? t('login.createAccountButton') : t('login.signInButton')
              )}
            </button>
          </div>
        </form>
         <div className="text-center">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-green-400">
              {isSignUp ? t('login.toggleToSignIn') : t('login.toggleToSignUp')}
            </button>
        </div>
      </div>
    </div>
  );
};
