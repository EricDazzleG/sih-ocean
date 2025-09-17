// Register Page JavaScript

// Import auth functions
import { signUp } from './auth.js';

// DOM Elements
const registerForm = document.getElementById('register-form');
const detectLocationBtn = document.getElementById('detect-location');
const locationInput = document.getElementById('location');
const statusMessage = document.getElementById('status-message');

// Initialize Register Page
document.addEventListener('DOMContentLoaded', () => {
    // Setup location detection
    if (detectLocationBtn && locationInput) {
        detectLocationBtn.addEventListener('click', detectUserLocation);
    }

    // Setup form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Detect user's current location
async function detectUserLocation() {
    const statusMessage = document.getElementById('status-message');
    
    if (!navigator.geolocation) {
        showStatusMessage('Geolocation is not supported by your browser', 'error');
        return;
    }

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        locationInput.value = `${latitude}, ${longitude}`;
        showStatusMessage('Location detected successfully!', 'success');
    } catch (error) {
        console.error('Error getting location:', error);
        showStatusMessage('Failed to get your location. Please enter it manually.', 'error');
    }
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
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
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Creating Account...';
    
    try {
        // Create user with Supabase Auth
        const userData = {
            name,
            phone,
            location,
            user_type: userType
        };
        
        const { user, error } = await signUp(email, password, userData);
        
        if (error) throw error;
        
        // Show success message
        const successMessage = 'Registration successful! ' + 
            (user.confirmed_at ? 'You are now logged in.' : 'Please check your email to confirm your account.');
            
        showStatusMessage(successMessage, 'success');
        
        // Redirect based on email confirmation status
        if (user.confirmed_at) {
            // If email is already confirmed, redirect to home
            window.location.href = 'index.html';
        } else {
            // Otherwise, redirect to login after a delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // More specific error messages
        let errorMessage = 'An error occurred during registration';
        
        if (error.message?.includes('already registered') || 
            error.message?.includes('already in use')) {
            errorMessage = 'This email is already registered. Please log in instead.';
        } else if (error.message?.includes('password')) {
            errorMessage = 'Password must be at least 6 characters long';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
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

// Show status message helper function
function showStatusMessage(message, type = 'info') {
    if (!statusMessage) return;
    
    // Clear previous messages and classes
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
    
    // Set message and add appropriate class
    statusMessage.textContent = message;
    statusMessage.classList.add(type);
    statusMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds for non-error messages
    if (type !== 'error') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}
