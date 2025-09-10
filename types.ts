export interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  leafWetness: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  sunlightHours: number;
  soilType: 'sandy' | 'clay' | 'loam';
  ph: number;
  fertility: 'Low' | 'Medium' | 'High';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy';
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical',
}

export interface FarmZone {
  id: number;
  name: string;
  riskLevel: RiskLevel;
  details: string;
}

export interface Alert {
  id: number;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  timestamp: string;
  acknowledged: boolean;
}

export enum ChatMessageSender {
  User = 'user',
  Bot = 'bot',
}

export interface ChatMessage {
  id:string;
  sender: ChatMessageSender;
  text: string;
}

export enum Page {
  Home = 'home',
  SpectralAnalysis = 'spectralAnalysis',
  Subscription = 'subscription',
  Settings = 'settings',
  DeviceSetup = 'deviceSetup',
  DeviceManagement = 'deviceManagement',
  CropAdvisor = 'cropAdvisor',
  MarketPrices = 'marketPrices',
  Community = 'community',
  Profile = 'profile',
}

export interface Device {
  id: string;
  name: string;
  connected: boolean;
}

export interface DeviceStatus {
  sensors: Device[];
  cameras: Device[];
}