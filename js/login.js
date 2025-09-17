// Login Page JavaScript

// Import from app.js
import { supabase, setSession } from './app.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const detectLocationBtn = document.getElementById('detect-location');
const locationInput = document.getElementById('location');
const statusMessage = document.getElementById('status-message');

// Initialize Login Page
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session
    checkSession();
    
    // Setup Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Setup Detect Location Button
    if (detectLocationBtn) {
        detectLocationBtn.addEventListener('click', detectLocation);
    }
});

// Check for existing session
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        // If user is already logged in, redirect to home
        window.location.href = 'index.html';
    }
}

// Handle Login Form Submission
async function handleLogin(event) {
    event.preventDefault();
    
    // Get form data
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value.trim();
    
    // Validate form data
    if (!name || !phone || !location) {
        showStatus('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    showStatus('Processing your request...', 'loading');
    
    try {
        // First try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: `${phone}@incois.user`,
            password: phone
        });
        
        if (signInError) {
            // If sign in fails, try to sign up
            if (signInError.message.includes('Invalid login credentials')) {
                // Sign up new user
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: `${phone}@incois.user`,
                    password: phone,
                    options: {
                        data: {
                            name,
                            phone,
                            location
                        }
                    }
                });
                
                if (signUpError) throw signUpError;
                
                // Store user info in localStorage
                storeUserData(name, phone, location);
                showStatus('Account created successfully! Please check your email for verification.', 'success');
                
                // Auto-login after signup
                await supabase.auth.signInWithPassword({
                    email: `${phone}@incois.user`,
                    password: phone
                });
                
            } else {
                throw signInError;
            }
        } else {
            // Existing user signed in successfully
            storeUserData(name, phone, location);
            showStatus('Welcome back! Logging you in...', 'success');
        }
        
        // Ensure user data is properly saved
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Update profile in database
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    name: name,
                    phone: phone,
                    location: location,
                    updated_at: new Date().toISOString()
                });
            
            if (profileError) {
                console.error('Error updating profile:', profileError);
            }
            
            // Update local storage with latest data
            localStorage.setItem('incois_user', JSON.stringify({
                name: name,
                phone: phone,
                location: location,
                id: user.id
            }));
        }
        
        // Force reload the header to show updated user info
        if (window.parent && window.parent.loadHeader) {
            window.parent.loadHeader();
        }
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        
    } catch (error) {
        console.error('Authentication error:', error);
        showStatus(error.message || 'An error occurred. Please try again.', 'error');
    }
}

// Store user data in localStorage
function storeUserData(name, phone, location) {
    localStorage.setItem('incois_user', JSON.stringify({
        name,
        phone,
        location
    }));
}

// Show status message
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'mt-4 p-3 rounded-md text-sm';
    
    switch (type) {
        case 'error':
            statusEl.classList.add('bg-red-100', 'text-red-700');
            break;
        case 'success':
            statusEl.classList.add('bg-green-100', 'text-green-700');
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