import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import { Page } from '../types';
import { ChevronLeftIcon } from './shared/IconComponents';

const CodeBlock: React.FC<{ language: string; children: React.ReactNode }> = ({ language, children }) => (
  <pre className="bg-slate-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
    <code className={`language-${language}`}>{children}</code>
  </pre>
);

interface DeviceSetupGuideProps {
    onNavClick: (page: Page) => void;
}

export const DeviceSetupGuide: React.FC<DeviceSetupGuideProps> = ({ onNavClick }) => {
  const { t } = useI18n();
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-2">
            <button 
                onClick={() => onNavClick(Page.Home)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label={t('tooltips.backToDashboard')}
            >
                <ChevronLeftIcon className="w-6 h-6 text-text-secondary dark:text-dark-text-secondary" />
            </button>
            <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">{t('pageTitles.deviceSetup')}</h1>
      </div>
      <p className="text-text-secondary dark:text-dark-text-secondary mb-6 ml-14">This guide provides example code and instructions for connecting your IoT sensors and cameras to a backend service that can forward data to this dashboard.</p>

      {/* Pro Feature Callout */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/50 dark:to-blue-900/50 p-6 rounded-xl shadow-md mb-8 border border-primary/30">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-2">{t('deviceSetup.proCallout.title')}</h2>
          <p className="text-text-secondary dark:text-dark-text-secondary mb-4">{t('deviceSetup.proCallout.description')}</p>
          <button 
              onClick={() => onNavClick(Page.Subscription)}
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
              {t('deviceSetup.proCallout.button')}
          </button>
      </div>

      <div className="space-y-8">
        <section className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">1. IoT Sensor Hub (ESP32/Arduino)</h2>
          <p className="mb-4 text-text-secondary dark:text-dark-text-secondary">
            Use a microcontroller like an ESP32 to read data from your sensors (e.g., DHT22 for temp/humidity, capacitive soil moisture sensor). Then, send this data as a JSON payload to your backend API endpoint via Wi-Fi.
          </p>
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-2">Example Arduino C++ Code (for ESP32)</h3>
          <CodeBlock language="cpp">{`
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Sensor pins (example)
#define SOIL_MOISTURE_PIN 34
#define DHT_PIN 4 

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* api_endpoint = "https://your-backend.com/api/sensor-data";
const char* api_key = "YOUR_BACKEND_API_KEY";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  // Read sensor values (dummy data for example)
  float temperature = 25.5;
  float humidity = 60.2;
  int soilMoistureRaw = analogRead(SOIL_MOISTURE_PIN);
  float soilMoisturePercent = map(soilMoistureRaw, 0, 4095, 100, 0);

  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soilMoisture"] = soilMoisturePercent;
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Send data to backend
  HTTPClient http;
  http.begin(api_endpoint);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", api_key);
  
  int httpResponseCode = http.POST(jsonPayload);
  
  if (httpResponseCode > 0) {
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();

  delay(60000); // Send data every minute
}
          `}</CodeBlock>
        </section>

        <section className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">2. Spectral Camera (Raspberry Pi)</h2>
          <p className="mb-4 text-text-secondary dark:text-dark-text-secondary">
            A Raspberry Pi with a NoIR (No Infrared) camera can be used for basic spectral imaging. You can run a Python script to capture images and upload them to a dedicated backend endpoint.
          </p>
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-2">Example Python Code (for Raspberry Pi)</h3>
          <CodeBlock language="python">{`
import requests
import picamera
import time
import base64

API_ENDPOINT = "https://your-backend.com/api/image-upload"
API_KEY = "YOUR_BACKEND_API_KEY"
IMAGE_PATH = "/home/pi/farm_image.jpg"

def capture_and_upload():
    with picamera.PiCamera() as camera:
        camera.resolution = (1024, 768)
        camera.start_preview()
        # Camera warm-up time
        time.sleep(2)
        camera.capture(IMAGE_PATH)
        camera.stop_preview()

    with open(IMAGE_PATH, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    
    payload = {
        "image_data": encoded_string,
        "filename": "farm_image.jpg"
    }
    
    headers = {
        "x-api-key": API_KEY
    }
    
    try:
        response = requests.post(API_ENDPOINT, json=payload, headers=headers)
        response.raise_for_status() # Raise an exception for bad status codes
        print(f"Image uploaded successfully! Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error uploading image: {e}")

if __name__ == "__main__":
    # Example: run this script every hour
    while True:
        capture_and_upload()
        time.sleep(3600)
          `}</CodeBlock>
        </section>

         <section className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mb-4">3. Backend Service</h2>
           <p className="mb-4 text-text-secondary dark:text-dark-text-secondary">
             A backend service (e.g., using Node.js, Python Flask, or a serverless function) is required to:
           </p>
           <ul className="list-disc ml-6 space-y-2 text-text-secondary dark:text-dark-text-secondary">
              <li>Provide secure API endpoints for your devices.</li>
              <li>Authenticate devices using API keys.</li>
              <li>Store incoming sensor and image data in a database (e.g., PostgreSQL, InfluxDB).</li>
              <li>Expose a secure API for this frontend dashboard to fetch the latest data.</li>
           </ul>
          <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mt-6 mb-2">Example Node.js (Express) Backend Snippet</h3>
          <p className="mb-4 text-text-secondary dark:text-dark-text-secondary">
            Here's a basic example of an Express.js server that creates an endpoint to receive sensor data. This is a simplified illustration; a production backend would require robust error handling, security measures (like HTTPS), and a proper database connection.
          </p>
          <CodeBlock language="javascript">{`
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies and authenticate
app.use(bodyParser.json());

const apiKeyMiddleware = (req, res, next) => {
    const providedApiKey = req.header('x-api-key');
    if (providedApiKey && providedApiKey === 'YOUR_BACKEND_API_KEY') {
        next(); // API key is valid, proceed
    } else {
        res.status(401).send('Unauthorized: Invalid API Key');
    }
};

// Apply the middleware to protected routes
app.use('/api/', apiKeyMiddleware);

// Endpoint to receive sensor data
app.post('/api/sensor-data', (req, res) => {
    const sensorData = req.body;
    console.log('Received sensor data:', sensorData);
    
    // TODO: Add code here to store sensorData in your database (e.g., PostgreSQL, InfluxDB)
    
    res.status(200).send({ message: 'Data received successfully' });
});

// Endpoint to fetch latest data for the dashboard (would need authentication)
app.get('/api/dashboard-data', (req, res) => {
    // TODO: Add code here to fetch the latest data from your database
    const latestData = {
        temperature: 24.5,
        humidity: 65,
        // ... other data points
    };
    res.json(latestData);
});


app.listen(port, () => {
    console.log(\`Backend server listening at http://localhost:\${port}\`);
});
          `}</CodeBlock>
         </section>
      </div>
    </div>
  );
};