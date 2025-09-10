import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, WeatherData, FarmZone, Alert, RiskLevel } from '../types';

const INITIAL_SENSOR_DATA: SensorData = {
  soilMoisture: 45,
  temperature: 22,
  humidity: 60,
  leafWetness: 30,
  nitrogen: 150,
  phosphorus: 70,
  potassium: 200,
  sunlightHours: 8,
  soilType: 'loam',
  ph: 6.8,
  fertility: 'Medium',
};

const INITIAL_WEATHER_DATA: WeatherData = {
  temperature: 24,
  humidity: 55,
  windSpeed: 10,
  condition: 'Sunny',
};

const getRiskLevel = (value: number, low: number, med: number, high: number): RiskLevel => {
  if (value < low) return RiskLevel.Low;
  if (value < med) return RiskLevel.Medium;
  if (value < high) return RiskLevel.High;
  return RiskLevel.Critical;
};


export const useSimulatedData = () => {
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [sensorData, setSensorData] = useState<SensorData>(INITIAL_SENSOR_DATA);
  const [weatherData, setWeatherData] = useState<WeatherData>(INITIAL_WEATHER_DATA);
  const [farmZones, setFarmZones] = useState<FarmZone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const updateCount = useRef(0);

  const generateNewAlerts = useCallback((currentSensorData: SensorData, currentWeatherData: WeatherData) => {
      const newAlerts: Alert[] = [];
      if (currentSensorData.soilMoisture < 20) {
        newAlerts.push({
          id: Date.now() + 1,
          title: 'Irrigation Needed',
          description: 'Soil moisture is critically low. Start irrigation cycle within 24 hours.',
          riskLevel: RiskLevel.High,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          acknowledged: false,
        });
      }
      if (currentSensorData.humidity > 80 && currentSensorData.leafWetness > 60) {
        newAlerts.push({
          id: Date.now() + 2,
          title: 'Fungal Disease Risk',
          description: 'High humidity and leaf wetness increase risk of fungal pathogens. Consider preventative spray.',
          riskLevel: RiskLevel.Critical,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          acknowledged: false,
        });
      }
       if (currentSensorData.temperature > 30 && currentSensorData.sunlightHours > 10) {
        newAlerts.push({
          id: Date.now() + 5,
          title: 'Heat Stress Warning',
          description: 'High temperatures and intense sun may cause heat stress. Ensure adequate watering.',
          riskLevel: RiskLevel.High,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          acknowledged: false,
        });
      }
      if (currentWeatherData.condition === 'Stormy' && currentWeatherData.windSpeed > 30) {
        newAlerts.push({
            id: Date.now() + 4,
            title: 'Severe Weather Warning',
            description: `Storm approaching with winds of ${currentWeatherData.windSpeed.toFixed(0)} km/h. Secure equipment.`,
            riskLevel: RiskLevel.Critical,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            acknowledged: false,
        });
      }
      if (currentSensorData.nitrogen < 100) {
        newAlerts.push({
          id: Date.now() + 3,
          title: 'Low Nitrogen Detected',
          description: 'Soil Nitrogen is low. Add Urea fertilizer within 7 days.',
          riskLevel: RiskLevel.Medium,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          acknowledged: false,
        });
      }
      return newAlerts;
    }, []);

  const acknowledgeAlert = useCallback((alertId: number) => {
    setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
    );
  }, []);

  const updateData = useCallback(() => {
    updateCount.current += 1;
    const soilTypes: SensorData['soilType'][] = ['loam', 'sandy', 'clay'];
    const fertilityLevels: SensorData['fertility'][] = ['Low', 'Medium', 'High'];
    
    let newWeatherData: WeatherData;
    setWeatherData(prev => {
        let newCondition = prev.condition;
        if (updateCount.current > 1 && updateCount.current % 4 === 0) { // change every 20s
            const random = Math.random();
            if (random < 0.15) newCondition = 'Stormy';
            else if (random < 0.3) newCondition = 'Rainy';
            else if (random < 0.6) newCondition = 'Cloudy';
            else newCondition = 'Sunny';
        }
        newWeatherData = {
            ...prev,
            condition: newCondition,
            temperature: Math.max(10, Math.min(35, prev.temperature + (Math.random() - 0.5) * 1.5)),
            windSpeed: Math.max(5, Math.min(50, prev.windSpeed + (Math.random() - 0.45) * 8)),
        };
        return newWeatherData;
    });

    setSensorData(prev => {
      const newSoilType = (updateCount.current % 12 === 0) // Change soil type every minute
        ? soilTypes[(soilTypes.indexOf(prev.soilType) + 1) % soilTypes.length]
        : prev.soilType;

      const newFertility = (updateCount.current % 10 === 0)
        ? fertilityLevels[(fertilityLevels.indexOf(prev.fertility) + 1) % fertilityLevels.length]
        : prev.fertility;

      const newData: SensorData = {
        soilMoisture: prev.soilMoisture + (Math.random() - 0.5) * 2,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.5,
        humidity: prev.humidity + (Math.random() - 0.5) * 3,
        leafWetness: prev.leafWetness + (Math.random() - 0.4) * 5,
        nitrogen: prev.nitrogen + (Math.random() - 0.5) * 5,
        phosphorus: prev.phosphorus + (Math.random() - 0.5) * 2,
        potassium: prev.potassium + (Math.random() - 0.5) * 3,
        sunlightHours: prev.sunlightHours + (Math.random() - 0.5) * 0.4,
        ph: prev.ph + (Math.random() - 0.5) * 0.1,
        soilType: newSoilType,
        fertility: newFertility,
      };

      // Clamp values
      Object.keys(newData).forEach(key => {
        const k = key as keyof SensorData;
        if (typeof newData[k] === 'number') {
            if (k === 'nitrogen' || k === 'potassium' || k === 'phosphorus') {
                (newData[k] as number) = Math.max(0, Math.min(300, newData[k] as number));
            } else if (k === 'sunlightHours') {
                (newData[k] as number) = Math.max(4, Math.min(12, newData[k] as number));
            } else if (k === 'ph') {
                (newData[k] as number) = Math.max(5.0, Math.min(8.0, newData[k] as number));
            }
            else {
                (newData[k] as number) = Math.max(0, Math.min(100, newData[k] as number));
            }
        }
      });
      
      setHistoricalData(h => [...h.slice(-29), newData]);

      if (newWeatherData) {
          const newAlerts = generateNewAlerts(newData, newWeatherData);
          if(newAlerts.length > 0){
            setAlerts(prevAlerts => [...newAlerts, ...prevAlerts].slice(0, 10)); // Allow more alerts
          }
      }

      return newData;
    });

    setFarmZones(() => Array.from({ length: 16 }, (_, i) => {
        const moisture = 30 + Math.random() * 50;
        const risk = getRiskLevel(moisture, 40, 60, 75);
        return {
          id: i,
          name: `Zone ${i + 1}`,
          riskLevel: risk,
          details: `Soil Moisture: ${moisture.toFixed(1)}%. ${risk === RiskLevel.High ? 'High risk of waterlogging.' : 'Conditions are stable.'}`
        }
    }));

  }, [generateNewAlerts]);

  useEffect(() => {
    const soilTypes: SensorData['soilType'][] = ['loam', 'sandy', 'clay'];
    const fertilityLevels: SensorData['fertility'][] = ['Low', 'Medium', 'High'];
    // Initial data load
    setHistoricalData(Array.from({length: 30}, (_, i) => ({
        soilMoisture: 45 + (Math.random() - 0.5) * 10,
        temperature: 22 + (Math.random() - 0.5) * 5,
        humidity: 60 + (Math.random() - 0.5) * 15,
        leafWetness: 30 + (Math.random() - 0.5) * 20,
        nitrogen: 150 + (Math.random() - 0.5) * 20,
        phosphorus: 70 + (Math.random() - 0.5) * 10,
        potassium: 200 + (Math.random() - 0.5) * 15,
        sunlightHours: 8 + (Math.random() - 0.5) * 2,
        ph: 6.8 + (Math.random() - 0.5) * 0.5,
        soilType: soilTypes[i % soilTypes.length],
        fertility: fertilityLevels[i % fertilityLevels.length],
    })))
    
    setAlerts([
        { id: 1, title: 'Initial System Check', description: 'All sensors are online and reporting.', riskLevel: RiskLevel.Low, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), acknowledged: false},
    ]);
    
    updateData();
    setIsInitialLoading(false);

    const intervalId = setInterval(updateData, 5000); // Update every 5 seconds
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isInitialLoading, sensorData, weatherData, farmZones, alerts, historicalData, acknowledgeAlert };
};