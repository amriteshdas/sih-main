export interface OpenWeatherResponse {
  weather: { main: string; description: string }[];
  main: { temp: number; humidity: number };
  wind: { speed: number };
}

export type SimpleCondition = 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy';

const mapCondition = (main: string): SimpleCondition => {
  const key = main.toLowerCase();
  if (key.includes('clear')) return 'Sunny';
  if (key.includes('rain') || key.includes('drizzle') || key.includes('thunder')) return 'Rainy';
  if (key.includes('storm')) return 'Stormy';
  return 'Cloudy';
};

export const fetchWeatherForLocation = async (locationName: string, apiKey?: string) => {
  const key = apiKey || (import.meta as any).env?.VITE_OPENWEATHER_API_KEY;
  if (!key) throw new Error('Missing OpenWeather API key. Set VITE_OPENWEATHER_API_KEY.');
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(locationName)}&appid=${key}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  const data: OpenWeatherResponse = await res.json();
  return {
    temperature: data.main?.temp ?? 0,
    humidity: data.main?.humidity ?? 0,
    windSpeed: data.wind?.speed ?? 0,
    condition: mapCondition(data.weather?.[0]?.main || ''),
  } as const;
};




