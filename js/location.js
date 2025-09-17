// Location Page JavaScript

// Import from app.js
import { getSession } from './app.js';

// DOM Elements
const userLocationElement = document.getElementById('user-location');
const nearbyAlertsElement = document.getElementById('nearby-alerts');

// Mock data for nearby alerts
const mockAlerts = {
    'Kerala': [
        { type: 'weather', message: 'Heavy rainfall expected in the next 24 hours.' },
        { type: 'coastal', message: 'High tide warning for coastal areas.' }
    ],
    'Tamil Nadu': [
        { type: 'weather', message: 'Strong winds expected along the coast.' }
    ],
    'West Bengal': [
        { type: 'cyclone', message: 'Cyclone warning: Prepare for heavy rainfall and strong winds.' },
        { type: 'flood', message: 'Flood alert for low-lying areas.' }
    ],
    'Gujarat': [
        { type: 'earthquake', message: 'Minor seismic activity detected offshore.' }
    ],
    'Maharashtra': [
        { type: 'coastal', message: 'Rough sea conditions expected for the next 48 hours.' }
    ],
    'Andhra Pradesh': [
        { type: 'weather', message: 'Thunderstorms expected in coastal districts.' }
    ],
    'Odisha': [
        { type: 'cyclone', message: 'Cyclone forming in Bay of Bengal, monitoring situation.' }
    ],
    'Goa': [
        { type: 'coastal', message: 'High waves expected, avoid sea activities.' }
    ]
};

// Default alerts for locations not in the mock data
const defaultAlerts = [
    { type: 'general', message: 'No specific alerts for your region at this time.' }
];

// Initialize Location Page
document.addEventListener('DOMContentLoaded', () => {
    // Load User Location
    loadUserLocation();
    
    // Load Nearby Alerts
    loadNearbyAlerts();
});

// Load User Location
function loadUserLocation() {
    if (!userLocationElement) return;
    
    const session = getSession();
    
    if (session) {
        const userLocation = session.user.user_metadata.location;
        userLocationElement.innerHTML = `
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="font-medium">${userLocation}</span>
            </div>
            <p class="mt-2 text-sm text-gray-600">Coordinates: <span class="font-mono">--° N, --° E</span> (Placeholder)</p>
        `;
    } else {
        userLocationElement.innerHTML = `
            <p class="text-gray-700">Please <a href="login.html" class="text-primary hover:underline">login</a> to view your location information.</p>
        `;
    }
}

// Load Nearby Alerts
function loadNearbyAlerts() {
    if (!nearbyAlertsElement) return;
    
    const session = getSession();
    
    if (session) {
        const userLocation = session.user.user_metadata.location;
        const alerts = mockAlerts[userLocation] || defaultAlerts;
        
        if (alerts.length === 0) {
            nearbyAlertsElement.innerHTML = `
                <p class="text-gray-700">No alerts for your area at this time.</p>
            `;
            return;
        }
        
        let alertsHTML = '';
        
        alerts.forEach(alert => {
            let alertColor = '';
            let alertIcon = '';
            
            // Set color and icon based on alert type
            switch (alert.type) {
                case 'cyclone':
                    alertColor = 'bg-red-100 text-red-800 border-red-200';
                    alertIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>`;
                    break;
                case 'weather':
                    alertColor = 'bg-blue-100 text-blue-800 border-blue-200';
                    alertIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>`;
                    break;
                case 'coastal':
                    alertColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                    alertIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>`;
                    break;
                case 'flood':
                    alertColor = 'bg-blue-100 text-blue-800 border-blue-200';
                    alertIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>`;
                    break;
                case 'earthquake':
                    alertColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    alertIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>`;
                    break;
                default:
                    alertColor = 'bg-gray-100 text-gray-800 border-gray-200';
                    alertIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>`;
            }
            
            alertsHTML += `
                <div class="p-3 rounded-lg border ${alertColor} flex items-start">
                    ${alertIcon}
                    <span>${alert.message}</span>
                </div>
            `;
        });
        
        nearbyAlertsElement.innerHTML = alertsHTML;
    } else {
        nearbyAlertsElement.innerHTML = `
            <p class="text-gray-700">Please <a href="login.html" class="text-primary hover:underline">login</a> to view alerts for your area.</p>
        `;
    }
}