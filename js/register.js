// Register Page JavaScript

import { supabase } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const statusMessage = document.getElementById('status-message');
    const detectLocationBtn = document.getElementById('detect-location');
    const locationInput = document.getElementById('location');

    // Handle location detection
    if (detectLocationBtn && locationInput) {
        detectLocationBtn.addEventListener('click', detectUserLocation);
    }

    // Handle form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Detect user's current location
async function detectUserLocation() {
    const locationInput = document.getElementById('location');
    const statusMessage = document.getElementById('status-message');
    
    if (!navigator.geolocation) {
        showStatusMessage('Geolocation is not supported by your browser', 'error');
        return;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        // Use reverse geocoding to get location name (simplified for demo)
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        if (data.display_name) {
            locationInput.value = data.display_name.split(',').slice(0, 3).join(',');
            showStatusMessage('Location detected successfully!', 'success');
        } else {
            showStatusMessage('Could not determine location name', 'warning');
        }
    } catch (error) {
        console.error('Error getting location:', error);
        showStatusMessage('Error detecting location. Please enter manually.', 'error');
    }
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const statusMessage = document.getElementById('status-message');
    
    // Get form values
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');
    const location = formData.get('location');
    const userType = formData.get('user-type');
    
    // Validate form
    if (password !== confirmPassword) {
        showStatusMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showStatusMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Creating Account...';
        
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    phone,
                    user_type: userType
                }
            }
        });
        
        if (authError) throw authError;
        
        // 2. Save additional user data to profiles table
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert([
                { 
                    id: authData.user.id,
                    email,
                    name,
                    phone,
                    location,
                    user_type: userType,
                    created_at: new Date().toISOString()
                }
            ]);
            
        if (profileError) throw profileError;
        
        // Show success message
        showStatusMessage('Registration successful! Redirecting to login...', 'success');
        
        // Redirect to login after a short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Registration error:', error);
        const errorMessage = error.message || 'An error occurred during registration';
        showStatusMessage(errorMessage, 'error');
    } finally {
        // Reset button state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Create Account';
        }
    }
}

// Helper function to show status messages
function showStatusMessage(message, type = 'info') {
    const statusMessage = document.getElementById('status-message');
    if (!statusMessage) return;
    
    // Clear previous classes and set new ones
    statusMessage.className = 'mt-4 p-3 rounded-md';
    statusMessage.classList.add(
        type === 'error' ? 'bg-red-100 text-red-700' :
        type === 'success' ? 'bg-green-100 text-green-700' :
        'bg-blue-100 text-blue-700'
    );
    
    statusMessage.textContent = message;
    statusMessage.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 5000);
}
