// Profile Page JavaScript

// Import from app.js
import { supabase, getSession, clearSession } from './app.js';

// DOM Elements
const profileImage = document.getElementById('profile-image');
const profileName = document.getElementById('profile-name');
const profileLocation = document.getElementById('profile-location');
const profilePhone = document.getElementById('profile-phone');
const reportsCount = document.getElementById('reports-count');
const alertsCount = document.getElementById('alerts-count');
const logoutButton = document.getElementById('logout-button');

// Initialize Profile Page
document.addEventListener('DOMContentLoaded', () => {
    // Load User Profile
    loadUserProfile();
    
    // Setup Logout Button
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

// Load User Profile
async function loadUserProfile() {
    const session = getSession();
    
    if (!session) {
        // Redirect to login if no session
        window.location.href = 'login.html';
        return;
    }
    
    const user = session.user;
    
    // Display user information
    if (profileName) profileName.textContent = user.user_metadata.name;
    if (profileLocation) profileLocation.textContent = `Location: ${user.user_metadata.location}`;
    if (profilePhone) profilePhone.textContent = `Phone: ${user.user_metadata.phone}`;
    
    // Set profile image or initials
    if (profileImage) {
        const initials = user.user_metadata.name
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase();
        
        profileImage.innerHTML = `<span>${initials}</span>`;
    }
    
    // Fetch user statistics
    try {
        // Get reports count
        const { data: reports, error: reportsError } = await supabase
            .from('reports')
            .select('id')
            .eq('user_id', user.id);
        
        if (!reportsError && reportsCount) {
            reportsCount.textContent = reports.length;
        }
        
        // For demo purposes, set a random number of alerts
        if (alertsCount) {
            alertsCount.textContent = Math.floor(Math.random() * 5);
        }
        
    } catch (error) {
        console.error('Error fetching user statistics:', error);
    }
}

// Handle Logout
function handleLogout() {
    // Clear session
    clearSession();
    
    // Redirect to login page
    window.location.href = 'login.html';
}