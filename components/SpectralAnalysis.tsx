import React, { useState, useRef, useCallback, useEffect } from 'react';
import { analyzeCropImage } from '../services/geminiService';
import { CameraIcon, SwitchCameraIcon, CloseIcon, Tooltip, ChevronLeftIcon } from './shared/IconComponents';
import { useI18n } from '../contexts/I18nContext';
import { Card } from './shared/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Device, Page } from '../types';


// A simple markdown parser
const Markdown: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = content
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3 mb-1">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');

    return <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [mimeType, base64] = result.split(';base64,');
            resolve({ base64, mimeType: mimeType.replace('data:', '') });
        };
        reader.onerror = error => reject(error);
    });
};

const preprocessImage = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(dataUrl);

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Apply contrast and enhance green channel to simulate spectral signature enhancement
            const contrast = 1.5;
            const intercept = 128 * (1 - contrast);

            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.max(0, Math.min(255, data[i] * contrast + intercept));     // Red
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * (contrast + 0.1) + intercept)); // Green (boosted)
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * contrast + intercept));     // Blue
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = () => resolve(dataUrl); // Return original if image fails to load
        img.src = dataUrl;
    });
};


interface Ailment {
  id: string;
  keywords: string[];
  emoji: string;
}

const ailmentDatabase: Ailment[] = [
  {
    id: 'powderyMildew',
    keywords: ['powdery mildew', 'white fungus', 'white spots'],
    emoji: '🍄',
  },
  {
    id: 'aphids',
    keywords: ['aphid', 'aphids', 'small green insects', 'sticky residue', 'honeydew'],
    emoji: '🐞',
  },
  {
    id: 'nitrogenDeficiency',
    keywords: ['nitrogen deficiency', 'yellowing leaves', 'stunted growth', 'pale green'],
    emoji: '📉',
  },
  {
    id: 'fusariumWilt',
    keywords: ['fusarium wilt', 'wilting', 'yellowing one side', 'vascular browning'],
    emoji: '🥀',
  }
];

const AilmentInfoCard: React.FC<{ ailment: Ailment; onClose: () => void }> = ({ ailment, onClose }) => {
  const { t } = useI18n();
  const name = t(`ailments.${ailment.id}.name`);
  const description = t(`ailments.${ailment.id}.description`);
  const lifecycle = t(`ailments.${ailment.id}.lifecycle`);
  const prevention = t(`ailments.${ailment.id}.prevention`);

  return (
    <div className="mt-6 bg-blue-50 dark:bg-blue-900/50 p-6 rounded-xl shadow-md border border-blue-200 dark:border-blue-700 relative animate-fade-in">
      <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="absolute top-4 right-4">
        <Tooltip text={t('tooltips.close')}>
          <button 
            onClick={onClose} 
            aria-label={t('spectral.ailmentSpotlight.closeAriaLabel')} 
            className="p-1 rounded-full text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800"
          >
            <CloseIcon className="w-5 h-5"/>
          </button>
        </Tooltip>
      </div>
      <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
        <span className="text-2xl mr-2">{ailment.emoji}</span> {t('spectral.ailmentSpotlight.title')}: {name}
      </h3>
      <div className="space-y-3">
        <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300">{t('spectral.ailmentSpotlight.description')}</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">{description}</p>
        </div>
        <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300">{t('spectral.ailmentSpotlight.lifecycle')}</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">{lifecycle}</p>
        </div>
        <div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300">{t('spectral.ailmentSpotlight.prevention')}</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">{prevention}</p>
        </div>
      </div>
    </div>
  );
};

const FilterButtons: React.FC<{
    onFilterChange: (keywords: string[] | null) => void;
}> = ({ onFilterChange }) => {
    const { t } = useI18n();
    const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

    const handleFilter = (ailment: Ailment | null) => {
        if (!ailment) {
            setActiveFilterId(null);
            onFilterChange(null);
        } else {
            setActiveFilterId(ailment.id);
            onFilterChange(ailment.keywords);
        }
    };
    
    return (
        <div className="mt-4 animate-fade-in">
            <h4 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-2">{t('spectral.filterReport.title')}</h4>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleFilter(null)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        !activeFilterId
                            ? 'bg-primary text-white border-transparent'
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                    {t('spectral.filterReport.all')}
                </button>
                {ailmentDatabase.map((ailment) => (
                    <button
                        key={ailment.id}
                        onClick={() => handleFilter(ailment)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors flex items-center gap-1.5 ${
                            activeFilterId === ailment.id
                                ? 'bg-primary text-white border-transparent'
                                : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        <span>{ailment.emoji}</span>
                        {t(`ailments.${ailment.id}.name`)}
                    </button>
                ))}
            </div>
        </div>
    );
};

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

interface SpectralAnalysisProps {
  viewMode: 'basic' | 'pro';
  isDeviceConnected: boolean;
  isAnalysisEnabled: boolean;
  connectedCameras: Device[];
  onNavClick: (page: Page) => void;
}


export const SpectralAnalysis: React.FC<SpectralAnalysisProps> = ({ viewMode, isDeviceConnected, isAnalysisEnabled, connectedCameras, onNavClick }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [showProcessedImage, setShowProcessedImage] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>();
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [zoomCapabilities, setZoomCapabilities] = useState<{ min: number; max: number; step: number } | null>(null);
  const [zoomValue, setZoomValue] = useState(1);
  const [matchedAilment, setMatchedAilment] = useState<Ailment | null>(null);
  const { t } = useI18n();
  const [activeFilterKeywords, setActiveFilterKeywords] = useState<string[] | null>(null);
  const [isLiveAnalysis, setIsLiveAnalysis] = useState(false);
  const [liveData, setLiveData] = useState({ nitrogen: 155, waterStress: 12, ndvi: 0 });
  const [ndviHistory, setNdviHistory] = useState<{ name: string; ndvi: number }[]>([]);
  const [historicalComparisonData, setHistoricalComparisonData] = useState<any[] | null>(null);
  const [currentProCameraIndex, setCurrentProCameraIndex] = useState(0);
  const animationFrameId = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setCurrentStream(null);
    setZoomCapabilities(null);
  }, [currentStream]);
  
  const startCamera = useCallback(async (deviceId?: string) => {
    if (currentStream) {
        stopCamera();
    }
    
    const constraints: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const [track] = stream.getVideoTracks();
      if (track) {
          setCurrentDeviceId(track.getSettings().deviceId);
          const capabilities = track.getCapabilities() as any;
          if (capabilities.zoom) {
              setZoomCapabilities({ min: capabilities.zoom.min, max: capabilities.zoom.max, step: capabilities.zoom.step });
              setZoomValue((track.getSettings() as any).zoom || 1);
          } else {
              setZoomCapabilities(null);
          }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCurrentStream(stream);
        setIsCameraOn(true);
        setError(null);
        if (!isLiveAnalysis) {
            setImageSrc(null);
            setAnalysisResult('');
            setProcessedImageSrc(null);
            setShowProcessedImage(false);
            setMatchedAilment(null);
            setHistoricalComparisonData(null);
        }
      }

      if (videoDevices.length === 0) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
      }

    } catch (err) {
      console.error("Error accessing camera:", err);
      let errorMessage = t('spectral.cameraError'); // Default message
      if (err instanceof DOMException) {
          switch (err.name) {
              case 'NotAllowedError':
                  errorMessage = t('spectral.cameraPermissionDenied');
                  break;
              case 'NotFoundError':
                  errorMessage = t('spectral.cameraNotFound');
                  break;
              case 'NotReadableError':
                  errorMessage = t('spectral.cameraInUse');
                  break;
              case 'SecurityError':
                  errorMessage = t('spectral.cameraSecureConnection');
                  break;
              default:
                  // Keep the generic error for other DOMExceptions
                  break;
          }
      }
      setError(errorMessage);
    }
  }, [stopCamera, t, videoDevices.length, currentStream, isLiveAnalysis]);

  const processLiveFrame = useCallback(() => {
    if (!isLiveAnalysis || !isCameraOn || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    if (video.readyState < 2) { // Ensure video metadata is loaded
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }
        animationFrameId.current = requestAnimationFrame(processLiveFrame);
        return;
    }
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    
    // Process a smaller version for performance
    const scale = 0.25;
    const width = video.videoWidth * scale;
    const height = video.videoHeight * scale;
    canvas.width = width;
    canvas.height = height;

    context.drawImage(video, 0, 0, width, height);
    
    try {
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
        let totalGreenness = 0;
        
        let ndviSum = 0;
        let validNdviPixelCount = 0;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Simple vegetation index (Visible Atmospherically Resistant Index - VARI)
            const vari = (g - r) / (g + r - b + 1e-6); // add epsilon to avoid div by zero
            totalGreenness += vari;

            // Calculate simulated NDVI from RGB channels
            const ndviDenominator = g + r;
            if (ndviDenominator > 40) { // Filter out very dark/noisy pixels to get a cleaner reading
                ndviSum += (g - r) / ndviDenominator;
                validNdviPixelCount++;
            }
        }

        const avgGreenness = totalGreenness / (data.length / 4);
        const avgNdvi = validNdviPixelCount > 0 ? ndviSum / validNdviPixelCount : 0;

        // Map this to our simulated nitrogen and water stress values
        const nitrogen = 150 + avgGreenness * 40;
        const waterStress = 15 - avgGreenness * 8;

        setLiveData({
            nitrogen: Math.max(100, Math.min(200, nitrogen)),
            waterStress: Math.max(5, Math.min(25, waterStress)),
            ndvi: Math.max(-1, Math.min(1, avgNdvi)),
        });
        
        setNdviHistory(h => [...h.slice(-29), { name: new Date().toLocaleTimeString([], { second: '2-digit' }), ndvi: avgNdvi }]);

    } catch (e) {
        console.error("Could not process video frame:", e);
    }

    animationFrameId.current = requestAnimationFrame(processLiveFrame);
  }, [isLiveAnalysis, isCameraOn]);
  
  useEffect(() => {
    if (isLiveAnalysis && isCameraOn) {
      animationFrameId.current = requestAnimationFrame(processLiveFrame);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isLiveAnalysis, isCameraOn, processLiveFrame]);


  const handleToggleLiveAnalysis = useCallback(() => {
    const nextState = !isLiveAnalysis;
    setIsLiveAnalysis(nextState);
    if (nextState) {
        startCamera(undefined);
    } else {
        stopCamera();
        setNdviHistory([]);
    }
  }, [isLiveAnalysis, startCamera, stopCamera]);

  const handleSwitchCamera = useCallback(() => {
     if (viewMode === 'pro') {
        if (connectedCameras.length < 2) return;
        setCurrentProCameraIndex(prev => (prev + 1) % connectedCameras.length);
    } else {
        if (videoDevices.length < 2) return;
        const currentIndex = videoDevices.findIndex(device => device.deviceId === currentDeviceId);
        const nextIndex = (currentIndex + 1) % videoDevices.length;
        const nextDeviceId = videoDevices[nextIndex].deviceId;
        startCamera(nextDeviceId);
    }
  }, [viewMode, connectedCameras, videoDevices, currentDeviceId, startCamera]);
  
  const handleZoomChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentStream || !zoomCapabilities) return;
    const [track] = currentStream.getVideoTracks();
    if (track) {
      try {
        const newZoom = parseFloat(e.target.value);
        setZoomValue(newZoom);
        await track.applyConstraints({ advanced: [{ zoom: newZoom } as any] });
      } catch (err) {
        console.error("Failed to apply zoom", err);
      }
    }
  }, [currentStream, zoomCapabilities]);

  useEffect(() => {
    // Cleanup: stop camera when component unmounts or view mode changes
    return () => {
      stopCamera();
      setIsLiveAnalysis(false);
    };
  }, [stopCamera, viewMode, isDeviceConnected]);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUrl);
        stopCamera();
        setNdviHistory([]);
      }
    }
  }, [stopCamera]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      stopCamera();
      setIsLiveAnalysis(false);
      setImageSrc(URL.createObjectURL(file));
      setAnalysisResult('');
      setError(null);
      setProcessedImageSrc(null);
      setShowProcessedImage(false);
      setMatchedAilment(null);
      setHistoricalComparisonData(null);
      setNdviHistory([]);
    }
  };

  const handleAnalyze = async () => {
    if (!imageSrc) return;
    setIsLoading(true);
    setError(null);
    setAnalysisResult('');
    setProcessedImageSrc(null);
    setShowProcessedImage(false);
    setMatchedAilment(null);
    setActiveFilterKeywords(null);
    setHistoricalComparisonData(null);
    try {
        setLoadingMessage(t('spectral.loading.preprocessing'));
        const processedDataUrl = await preprocessImage(imageSrc);
        setProcessedImageSrc(processedDataUrl);
        setShowProcessedImage(true);
        
        const fetchRes = await fetch(processedDataUrl);
        const blob = await fetchRes.blob();
        const tempFile = new File([blob], "processed.jpg", { type: blob.type });

        const { base64, mimeType } = await fileToBase64(tempFile);
        
        setLoadingMessage(t('spectral.loading.queryingAI'));

        const result = await analyzeCropImage(base64, mimeType);
        setAnalysisResult(result);

        const lowercasedResult = result.toLowerCase();
        const foundAilment = ailmentDatabase.find(ailment =>
            ailment.keywords.some(keyword => lowercasedResult.includes(keyword))
        ) || null;
        setMatchedAilment(foundAilment);
        
        const generateHistoricalData = (isHealthy: boolean) => {
            const currentScore = isHealthy 
                ? Math.floor(85 + Math.random() * 10) // 85-94
                : Math.floor(60 + Math.random() * 15); // 60-74

            const data = Array.from({ length: 5 }, (_, i) => ({
                name: t('spectral.historical.daysAgo', { count: 5 - i }),
                healthScore: Math.floor(70 + Math.random() * 25),
            }));

            data.push({
                name: t('spectral.historical.today'),
                healthScore: currentScore
            });
            return data;
        };

        const historyData = generateHistoricalData(!foundAilment);
        setHistoricalComparisonData(historyData);


    } catch (err) {
        console.error("Analysis failed:", err);
        let userFriendlyError = t('spectral.analysisError'); // Default generic error.
        if (err instanceof Error) {
            const errorMsg = err.message.toLowerCase();
            if (errorMsg.includes("analysis service returned an empty response")) {
                userFriendlyError = t('spectral.analysisEmptyResponse');
            } else if (errorMsg.includes("service is currently unavailable")) {
                 userFriendlyError = t('spectral.analysisServiceUnavailable');
            } else if (errorMsg.includes('network') || errorMsg.includes('failed to fetch')) {
                // Check for network errors
                userFriendlyError = t('spectral.analysisNetworkError');
            }
        }
        setError(userFriendlyError);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };
  
  const highlightKeywords = (text: string, keywords: string[] | null): string => {
      if (!keywords || keywords.length === 0) {
          return text;
      }
      const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
      return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-700/50 rounded px-1">$1</mark>');
  };

  const reportContent = highlightKeywords(analysisResult, activeFilterKeywords);

  if (!isAnalysisEnabled) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center min-h-[calc(100vh-150px)]">
          <CameraIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4"/>
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{t('spectral.proMode.title')}</h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mt-2 max-w-md">{t('spectral.proMode.description')}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
       <div className="flex items-center gap-4 mb-6">
            <button 
                onClick={() => onNavClick(Page.Home)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label={t('tooltips.backToDashboard')}
            >
                <ChevronLeftIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary" />
            </button>
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('pageTitles.spectralAnalysis')}</h1>
       </div>
       {viewMode === 'pro' && (
        <div className="bg-blue-50 dark:bg-blue-900/50 p-4 rounded-xl text-center mb-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-bold text-blue-800 dark:text-blue-200">{t('spectral.proFeature.title')}</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{t('spectral.proFeature.description')}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('spectral.title')}</h2>
            {viewMode === 'pro' && isDeviceConnected && (
                <div className="flex items-center justify-between mb-4 bg-background dark:bg-dark-background p-3 rounded-lg">
                    <div>
                        <p className="font-semibold text-text-primary dark:text-dark-text-primary">{t('spectral.liveAnalysis.title')}</p>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{t('spectral.liveAnalysis.description')}</p>
                    </div>
                    <ToggleSwitch 
                        checked={isLiveAnalysis} 
                        onChange={handleToggleLiveAnalysis}
                        ariaLabel={t('spectral.liveAnalysis.toggleAriaLabel')}
                    />
                </div>
            )}
            <div className="relative aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {(isCameraOn || isLiveAnalysis) ? (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                ) : showProcessedImage && processedImageSrc ? (
                    <img src={processedImageSrc} alt={t('spectral.cropImageAlt')} className="w-full h-full object-contain" />
                ) : imageSrc ? (
                    <img src={imageSrc} alt={t('spectral.cropImageAlt')} className="w-full h-full object-contain" />
                ) : (
                    <CameraIcon className="w-24 h-24 text-slate-400 dark:text-slate-500" />
                )}
                <canvas ref={canvasRef} className="hidden"></canvas>
                
                 {isCameraOn && viewMode === 'pro' && connectedCameras.length > 0 && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-md z-10">
                        {t('spectral.proCameraLabel', { cameraName: connectedCameras[currentProCameraIndex].name })}
                    </div>
                )}


                 {processedImageSrc && !isCameraOn && (
                    <div className="absolute top-2 left-2 z-20 bg-black/50 p-1 rounded-lg flex items-center text-white text-xs backdrop-blur-sm">
                        <button onClick={() => setShowProcessedImage(false)} className={`px-2 py-0.5 rounded-md transition-colors ${!showProcessedImage ? 'bg-white text-black font-semibold' : 'hover:bg-white/20'}`}>{t('spectral.imageToggle.original')}</button>
                        <button onClick={() => setShowProcessedImage(true)} className={`px-2 py-0.5 rounded-md transition-colors ${showProcessedImage ? 'bg-white text-black font-semibold' : 'hover:bg-white/20'}`}>{t('spectral.imageToggle.processed')}</button>
                    </div>
                )}
                
                {isLoading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg z-10">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                        <p className="text-white mt-4 font-semibold">{loadingMessage || t('spectral.analyzing')}</p>
                    </div>
                )}
                {isLiveAnalysis && isCameraOn && (
                     <div className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-lg text-sm font-mono backdrop-blur-sm shadow-lg">
                        <p>N: {liveData.nitrogen.toFixed(1)} ppm</p>
                        <p>H₂O Stress: {liveData.waterStress.toFixed(1)}%</p>
                        <Tooltip text={t('spectral.liveAnalysis.ndviTooltip')} position="left">
                            <p className="cursor-help">{t('spectral.liveAnalysis.ndviLabel')}: {liveData.ndvi.toFixed(2)}</p>
                        </Tooltip>
                    </div>
                )}
                {(isCameraOn || isLiveAnalysis) && viewMode === 'pro' && isDeviceConnected && zoomCapabilities && (
                  <div className="absolute bottom-4 left-4 right-4 z-20 bg-black/40 p-2 rounded-lg backdrop-blur-sm">
                      <input
                          type="range"
                          min={zoomCapabilities.min}
                          max={zoomCapabilities.max}
                          step={zoomCapabilities.step}
                          value={zoomValue}
                          onChange={handleZoomChange}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          aria-label={t('spectral.zoomAriaLabel')}
                      />
                  </div>
                )}
            </div>
             {processedImageSrc && !isCameraOn && (
                <p className="text-xs text-center text-text-secondary dark:text-dark-text-secondary -mt-2 mb-4">
                    {t('spectral.imageToggle.description')}
                </p>
            )}

            <div className="flex flex-wrap gap-2">
                {!isCameraOn && !isLiveAnalysis && <button onClick={() => startCamera()} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">{t('spectral.startCamera')}</button>}
                {isCameraOn && !isLiveAnalysis && (
                    <div className="flex-1 flex gap-2">
                        <button onClick={captureImage} className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">{t('spectral.capture')}</button>
                        {((viewMode === 'basic' && videoDevices.length > 1) || (viewMode === 'pro' && connectedCameras.length > 1)) && (
                            <Tooltip text={t('tooltips.switchCamera')}>
                                <button onClick={handleSwitchCamera} aria-label={t('spectral.switchCamera')} className="bg-slate-500 text-white p-2 rounded-lg font-semibold hover:bg-slate-600 transition-colors">
                                    <SwitchCameraIcon className="w-6 h-6"/>
                                </button>
                            </Tooltip>
                        )}
                        <button onClick={stopCamera} className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors">{t('spectral.stopCamera')}</button>
                    </div>
                )}
                {!isLiveAnalysis && (
                    <>
                        <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition-colors">{t('spectral.uploadFile')}</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <button onClick={handleAnalyze} disabled={!imageSrc || isLoading} className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors">
                            {t('spectral.analyzeCrop')}
                        </button>
                    </>
                )}
            </div>
             {error && <p className="text-red-500 mt-4 text-center font-medium">{error}</p>}
             {isLiveAnalysis && ndviHistory.length > 0 && (
                <Card title={t('spectral.historical.ndviChartTitle')} className="mt-6 animate-fade-in">
                    <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={ndviHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke={'#475569'} style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke={'#475569'} domain={[-1, 1]} />
                            <RechartsTooltip contentStyle={{ backgroundColor: 'black', opacity: 0.8 }}/>
                            <Line type="monotone" dataKey="ndvi" name={t('spectral.historical.ndviTooltipLabel')} stroke="#82ca9d" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            )}
        </div>
        <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary mb-4">{t('spectral.reportTitle')}</h2>
             {analysisResult && (
                <FilterButtons onFilterChange={setActiveFilterKeywords} />
            )}
            <div className="mt-4 max-h-[22rem] overflow-y-auto p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                {analysisResult ? <Markdown content={reportContent} /> : !isLoading && <p className="text-text-secondary dark:text-dark-text-secondary text-center">{t('spectral.reportPlaceholder')}</p>}
            </div>
             {matchedAilment && (
                <AilmentInfoCard ailment={matchedAilment} onClose={() => setMatchedAilment(null)} />
            )}
            {historicalComparisonData && (
                <Card title={t('spectral.historical.chartTitle')} className="mt-6 animate-fade-in">
                    <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={historicalComparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke={'#475569'} style={{ fontSize: '0.75rem' }} />
                            <YAxis stroke={'#475569'} domain={[0, 100]} />
                            <RechartsTooltip contentStyle={{ backgroundColor: 'black', opacity: 0.8 }}/>
                            <Line type="monotone" dataKey="healthScore" name={t('spectral.historical.tooltipLabel')} stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
};