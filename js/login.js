// Login Page JavaScript
import { supabase } from './app.js';
import { loginUser, registerUser, isAuthenticated, getCurrentUser } from './auth.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const toggleRegisterBtn = document.getElementById('toggle-register');
const submitButton = document.getElementById('submit-button');
const registrationFields = document.getElementById('registration-fields');
const detectLocationBtn = document.getElementById('detect-location');
let isRegistering = false;

// Initialize Login Page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Setup form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleAuth);
    }
    
    // Toggle between login and register forms
    if (toggleRegisterBtn) {
        toggleRegisterBtn.addEventListener('click', toggleRegister);
    }
    
    // Setup location detection
    if (detectLocationBtn) {
        detectLocationBtn.addEventListener('click', detectLocation);
    }
});

// Toggle between login and register forms
function toggleRegister() {
    isRegistering = !isRegistering;
    
    if (isRegistering) {
        // Show registration fields
        registrationFields.classList.remove('hidden');
        submitButton.textContent = 'Register';
        toggleRegisterBtn.textContent = 'Already have an account? Login';
        
        // Add required attributes to registration fields
        document.getElementById('name').required = true;
        document.getElementById('phone').required = true;
        document.getElementById('location').required = true;
    } else {
        // Hide registration fields
        registrationFields.classList.add('hidden');
        submitButton.textContent = 'Login';
        toggleRegisterBtn.textContent = "Don't have an account? Register";
        
        // Remove required attributes
        document.getElementById('name').required = false;
        document.getElementById('phone').required = false;
        document.getElementById('location').required = false;
    }
}

// Handle form submission (login/register)
async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate common fields
    if (!email || !password) {
        showStatus('Please fill in all required fields.', 'error');
        return;
    }
    
    if (isRegistering) {
        // Handle registration
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const location = document.getElementById('location').value.trim();
        
        if (!name || !phone || !location) {
            showStatus('Please fill in all registration fields.', 'error');
            return;
        }
        
        // Show loading state
        showStatus('Creating your account...', 'loading');
        
        try {
            const { user, error } = await registerUser(email, password, { name, phone, location });
            
            if (error) throw new Error(error);
            
            showStatus('Account created successfully! Logging you in...', 'success');
            
            // Auto-login after successful registration
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Registration error:', error);
            showStatus(error.message || 'Registration failed. Please try again.', 'error');
        }
        
    } else {
        // Handle login
        showStatus('Logging in...', 'loading');
        
        try {
            const { user, error } = await loginUser(email, password);
            
            if (error) throw new Error(error);
            
            showStatus('Login successful! Redirecting...', 'success');
            
            // Redirect after successful login
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
            
        } catch (error) {
            console.error('Login error:', error);
            showStatus(error.message || 'Invalid email or password. Please try again.', 'error');
        }
    }
}

// Detect User's Location
function detectLocation() {
    if (navigator.geolocation) {
        showStatus('Detecting your location...', 'loading');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // For demo purposes, we'll use a mock location based on coordinates
                const mockLocations = {
                    'North India': { minLat: 28, maxLat: 35, minLng: 75, maxLng: 85 },
                    'South India': { minLat: 8, maxLat: 20, minLng: 72, maxLng: 85 },
                    'East India': { minLat: 20, maxLat: 28, minLng: 85, maxLng: 95 },
                    'West India': { minLat: 20, maxLat: 28, minLng: 68, maxLng: 75 },
                    'Central India': { minLat: 20, maxLat: 28, minLng: 75, maxLng: 85 },
                    'Kerala': { minLat: 8, maxLat: 13, minLng: 74, maxLng: 78 }
                };
                
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                let detectedLocation = 'India'; // Default
                
                for (const [location, bounds] of Object.entries(mockLocations)) {
                    if (lat >= bounds.minLat && lat <= bounds.maxLat &&
                        lng >= bounds.minLng && lng <= bounds.maxLng) {
                        detectedLocation = location;
                        break;
                    }
                }
                
                document.getElementById('location').value = detectedLocation;
                showStatus('Location detected successfully!', 'success');
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    const statusEl = document.getElementById('status-message');
                    if (statusEl) statusEl.classList.add('hidden');
                }, 3000);
                
            },
            (error) => {
                console.error('Geolocation error:', error);
                showStatus('Could not detect your location. Please enter it manually.', 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        showStatus('Geolocation is not supported by your browser. Please enter your location manually.', 'error');
    }
}

// Show status message
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    if (!statusEl) return;
    
    // Clear any existing timeouts
    if (window.statusTimeout) {
        clearTimeout(window.statusTimeout);
    }
    
    statusEl.textContent = message;
    statusEl.className = 'mt-4 p-3 rounded-md text-sm';
    
    switch (type) {
        case 'error':
            statusEl.classList.add('bg-red-100', 'text-red-700');
            break;
        case 'success':
            statusEl.classList.add('bg-green-100', 'text-green-700');
            // Auto-hide success messages after 5 seconds
            window.statusTimeout = setTimeout(() => {
                statusEl.classList.add('hidden');
            }, 5000);
            break;
        case 'loading':
            statusEl.classList.add('bg-blue-100', 'text-blue-700');
            statusEl.innerHTML = `${message} <span class="animate-pulse">...</span>`;
            break;
        default:
            statusEl.classList.add('bg-blue-100', 'text-blue-700');
    }
    
    statusEl.classList.remove('hidden');
}

// Detect User's Location
function detectLocation() {
    if (navigator.geolocation) {
        showStatus('Detecting your location...', 'loading');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // For demo purposes, we'll use a mock location based on coordinates
                // In a real app, you would use reverse geocoding API
                const mockLocations = {
                    'North India': { minLat: 28, maxLat: 35, minLng: 75, maxLng: 85 },
                    'South India': { minLat: 8, maxLat: 20, minLng: 72, maxLng: 85 },
                    'East India': { minLat: 20, maxLat: 28, minLng: 85, maxLng: 95 },
                    'West India': { minLat: 20, maxLat: 28, minLng: 68, maxLng: 75 },
                    'Central India': { minLat: 20, maxLat: 28, minLng: 75, maxLng: 85 },
                    'Kerala': { minLat: 8, maxLat: 13, minLng: 74, maxLng: 78 }
                };
                
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                let detectedLocation = 'India'; // Default
                
                for (const [location, bounds] of Object.entries(mockLocations)) {
                    if (lat >= bounds.minLat && lat <= bounds.maxLat && 
                        lng >= bounds.minLng && lng <= bounds.maxLng) {
                        detectedLocation = location;
                        break;
                    }
                }
                
                locationInput.value = detectedLocation;
                showStatus(`Location detected: ${detectedLocation}`, 'success', 2000);
            },
            (error) => {
                console.error('Geolocation error:', error);
                showStatus('Could not detect location. Please enter manually.', 'error');
            }
        );
    } else {
        showStatus('Geolocation is not supported by your browser. Please enter location manually.', 'error');
    }
}

// Show Status Message
function showStatus(message, type, duration = 3000) {
    if (!statusMessage) return;
    
    // Set message and style based on type
    statusMessage.textContent = message;
    statusMessage.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800', 'bg-blue-100', 'text-blue-800');
    
    switch (type) {
        case 'success':
            statusMessage.classList.add('bg-green-100', 'text-green-800');
            break;
        case 'error':
            statusMessage.classList.add('bg-red-100', 'text-red-800');
            break;
        case 'loading':
            statusMessage.classList.add('bg-blue-100', 'text-blue-800');
            break;
    }
    
    // Show the message
    statusMessage.classList.remove('hidden');
    
    // Hide after duration if not loading
    if (type !== 'loading') {
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, duration);
    }
}