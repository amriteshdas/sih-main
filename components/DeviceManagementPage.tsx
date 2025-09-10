import React, { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Page } from '../types';
// FIX: The 'Device' and 'DeviceStatus' types are exported from '../types', not '../App'.
import { Device, DeviceStatus } from '../types';
import { CpuChipIcon, CameraIcon, TrashIcon, Tooltip, SparklesIcon, ChevronLeftIcon } from './shared/IconComponents';

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

interface DeviceManagementPageProps {
  deviceStatus: DeviceStatus;
  onSetDeviceStatus: React.Dispatch<React.SetStateAction<DeviceStatus>>;
  onNavClick: (page: Page) => void;
  hasSubscription: boolean;
}

const UpgradePrompt: React.FC<{ message: string; onNavClick: (page: Page) => void; }> = ({ message, onNavClick }) => {
    const { t } = useI18n();
    return (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <SparklesIcon className="w-8 h-8 mx-auto text-primary mb-2"/>
            <h4 className="font-bold text-primary">{t('deviceManagementPage.upgradePrompt.title')}</h4>
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">{message}</p>
            <button onClick={() => onNavClick(Page.Subscription)} className="mt-3 px-3 py-1 text-sm bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors">{t('deviceManagementPage.upgradePrompt.button')}</button>
        </div>
    )
}

export const DeviceManagementPage: React.FC<DeviceManagementPageProps> = ({ deviceStatus, onSetDeviceStatus, onNavClick, hasSubscription }) => {
  const { t } = useI18n();
  const [newSensorName, setNewSensorName] = useState('');
  const [newCameraName, setNewCameraName] = useState('');
  const [deviceToDelete, setDeviceToDelete] = useState<{ type: 'sensors' | 'cameras'; id: string; name: string } | null>(null);

  const canAddSensor = hasSubscription || deviceStatus.sensors.length < 1;
  const canAddCamera = hasSubscription;

  const handleAddDevice = (type: 'sensors' | 'cameras') => {
    if (type === 'sensors' && !canAddSensor) return;
    if (type === 'cameras' && !canAddCamera) return;

    const name = type === 'sensors' ? newSensorName.trim() : newCameraName.trim();
    if (!name) return;

    const newDevice: Device = {
      id: `${type.slice(0, 1)}${Date.now()}`,
      name: name,
      connected: true,
    };

    onSetDeviceStatus(prev => ({
      ...prev,
      [type]: [...prev[type], newDevice]
    }));
    
    if (type === 'sensors') {
      setNewSensorName('');
    } else {
      setNewCameraName('');
    }
  };

  const handleConfirmDelete = () => {
    if (!deviceToDelete) return;

    const { type, id } = deviceToDelete;
    onSetDeviceStatus(prev => ({
      ...prev,
      [type]: prev[type].filter(device => device.id !== id)
    }));
    setDeviceToDelete(null);
  };

  const handleToggleDevice = (type: 'sensors' | 'cameras', id: string) => {
    onSetDeviceStatus(prev => ({
      ...prev,
      [type]: prev[type].map(device => 
        device.id === id ? { ...device, connected: !device.connected } : device
      )
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'sensors' | 'cameras') => {
    if (e.key === 'Enter') {
      handleAddDevice(type);
    }
  };

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
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('pageTitles.deviceManagement')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sensors Card */}
        <div className="bg-card dark:bg-dark-card rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4 flex items-center"><CpuChipIcon className="w-6 h-6 mr-2" /> {t('deviceManagementPage.sensors.title')}</h2>
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
            {deviceStatus.sensors.map(sensor => (
              <div key={sensor.id} className="flex items-center justify-between p-3 rounded-lg bg-background dark:bg-dark-background">
                <div className="flex items-center flex-grow truncate mr-2">
                  <Tooltip text={sensor.connected ? t('tooltips.deviceConnected') : t('tooltips.deviceDisconnected')}>
                    <span className={`h-2.5 w-2.5 rounded-full mr-3 flex-shrink-0 ${sensor.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  </Tooltip>
                  <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary truncate" title={sensor.name}>{sensor.name}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ToggleSwitch checked={sensor.connected} onChange={() => handleToggleDevice('sensors', sensor.id)} ariaLabel={`Toggle ${sensor.name}`} />
                  <Tooltip text={t('deviceManagementPage.deleteButton')}>
                    <button onClick={() => setDeviceToDelete({ type: 'sensors', id: sensor.id, name: sensor.name })} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-500/10 transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-4 border-t border-border dark:border-dark-border">
            {canAddSensor ? (
              <>
                <h3 className="text-md font-semibold text-text-primary dark:text-dark-text-primary">{t('deviceManagementPage.sensors.addTitle')}</h3>
                <div className="flex gap-2">
                  <input type="text" value={newSensorName} onChange={e => setNewSensorName(e.target.value)} onKeyPress={(e) => handleKeyPress(e, 'sensors')} placeholder={t('deviceManagementPage.sensors.placeholder')} className="flex-grow px-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                  <button onClick={() => handleAddDevice('sensors')} className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-slate-400" disabled={!newSensorName.trim()}>{t('deviceManagementPage.addButton')}</button>
                </div>
              </>
            ) : (
              <UpgradePrompt message={t('deviceManagementPage.upgradePrompt.sensors')} onNavClick={onNavClick} />
            )}
          </div>
        </div>

        {/* Cameras Card */}
        <div className="bg-card dark:bg-dark-card rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4 flex items-center"><CameraIcon className="w-6 h-6 mr-2" /> {t('deviceManagementPage.cameras.title')}</h2>
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
            {deviceStatus.cameras.map(camera => (
              <div key={camera.id} className="flex items-center justify-between p-3 rounded-lg bg-background dark:bg-dark-background">
                <div className="flex items-center flex-grow truncate mr-2">
                   <Tooltip text={camera.connected ? t('tooltips.deviceConnected') : t('tooltips.deviceDisconnected')}>
                    <span className={`h-2.5 w-2.5 rounded-full mr-3 flex-shrink-0 ${camera.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  </Tooltip>
                  <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary truncate" title={camera.name}>{camera.name}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ToggleSwitch checked={camera.connected} onChange={() => handleToggleDevice('cameras', camera.id)} ariaLabel={`Toggle ${camera.name}`} />
                  <Tooltip text={t('deviceManagementPage.deleteButton')}>
                    <button onClick={() => setDeviceToDelete({ type: 'cameras', id: camera.id, name: camera.name })} className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-500/10 transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-4 border-t border-border dark:border-dark-border">
            {canAddCamera ? (
              <>
                <h3 className="text-md font-semibold text-text-primary dark:text-dark-text-primary">{t('deviceManagementPage.cameras.addTitle')}</h3>
                <div className="flex gap-2">
                  <input type="text" value={newCameraName} onChange={e => setNewCameraName(e.target.value)} onKeyPress={(e) => handleKeyPress(e, 'cameras')} placeholder={t('deviceManagementPage.cameras.placeholder')} className="flex-grow px-3 py-2 text-text-primary dark:text-dark-text-primary bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                  <button onClick={() => handleAddDevice('cameras')} className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-slate-400" disabled={!newCameraName.trim()}>{t('deviceManagementPage.addButton')}</button>
                </div>
              </>
            ) : (
                <UpgradePrompt message={t('deviceManagementPage.upgradePrompt.cameras')} onNavClick={onNavClick} />
            )}
          </div>
        </div>
      </div>

       {deviceToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
            <div className="bg-card dark:bg-dark-card rounded-xl shadow-lg p-6 max-w-sm w-full animate-slideInRight animation-delay-100">
                <h3 id="delete-dialog-title" className="text-lg font-bold text-text-primary dark:text-dark-text-primary">{t('deviceManagementPage.deleteConfirm.title')}</h3>
                <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                    {t('deviceManagementPage.deleteConfirm.message', { deviceName: deviceToDelete.name })}
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => setDeviceToDelete(null)}
                        className="px-4 py-2 rounded-lg font-semibold bg-slate-200 dark:bg-slate-600 text-text-primary dark:text-dark-text-primary hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    >
                        {t('deviceManagementPage.deleteConfirm.cancelButton')}
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                        {t('deviceManagementPage.deleteConfirm.confirmButton')}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};