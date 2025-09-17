// Login Page JavaScript

// Import auth functions
import { signIn, signUp, getSession } from './auth.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const detectLocationBtn = document.getElementById('detect-location');
const locationInput = document.getElementById('location');
const statusMessage = document.getElementById('status-message');

// Helper: redirect after login (uses stored intended path if any)
function redirectAfterLogin() {
    try {
        const intended = localStorage.getItem('post_login_redirect');
        if (intended) {
            localStorage.removeItem('post_login_redirect');
            window.location.href = intended;
            return;
        }
    } catch {}
    window.location.href = 'index.html';
}

// Initialize Login Page
document.addEventListener('DOMContentLoaded', async () => {
    // Check for existing session
    try {
        const session = await getSession();
        if (session) {
            // If user is already logged in, go to intended page or home
            if (window.parent && typeof window.parent.loadHeader === 'function') {
                window.parent.loadHeader();
            }
            redirectAfterLogin();
            return;
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }
    
    // Setup location detection
    if (detectLocationBtn) {
        detectLocationBtn.addEventListener('click', detectLocation);
    }
    
    // Setup form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get form values
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Validate form
    if (!email || !password) {
        showStatusMessage('Please enter both email and password', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Logging in...';
    
    try {
        // Attempt to sign in
        const { user, error } = await signIn(email, password);
        
        if (error) {
            // Handle specific error cases
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('Invalid email or password');
            } else if (error.message.includes('Email not confirmed')) {
                throw new Error('Please check your email to confirm your account before logging in');
            } else {
                throw error;
            }
        }
        
        // Login successful
        showStatusMessage('Login successful! Redirecting...', 'success');
        
        // Refresh header so hamburger menu shows Logout
        if (window.parent && typeof window.parent.loadHeader === 'function') {
            window.parent.loadHeader();
        }
        
        // Redirect to intended page or home
        setTimeout(() => {
            redirectAfterLogin();
        }, 600);
        
    } catch (error) {
        console.error('Login error:', error);
        showStatusMessage(error.message || 'An error occurred during login', 'error');
    } finally {
        // Reset button state
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
}

// Detect user's current location
async function detectLocation() {
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

// Local status message helper (kept here to avoid importing UI helpers from auth)
function showStatusMessage(message, type = 'info') {
    const el = document.getElementById('status-message');
    if (!el) return;
    el.textContent = message;
    el.className = 'mt-4 p-3 rounded-md text-sm';
    el.classList.remove('hidden');
    // reset styles
    el.classList.remove('bg-green-100','text-green-800','bg-red-100','text-red-800','bg-blue-100','text-blue-800');
    if (type === 'success') el.classList.add('bg-green-100','text-green-800');
    else if (type === 'error') el.classList.add('bg-red-100','text-red-800');
    else el.classList.add('bg-blue-100','text-blue-800');
    if (type !== 'error') {
        setTimeout(() => el.classList.add('hidden'), 5000);
    }
}