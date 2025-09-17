// Main Application JavaScript

// Supabase Configuration
const SUPABASE_URL = 'https://uxculnxvfukuiczadoqz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Y3Vsbnh2ZnVrdWljemFkb3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTc3OTEsImV4cCI6MjA3MzY5Mzc5MX0.YebX841KOKE2PP_DChIV70vHr3H4xTdHqxbDOx9C89M';

// Initialize Supabase Client
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Session management
export function setSession(session) {
    localStorage.setItem('incois_session', JSON.stringify(session));
}

// DOM Elements
const headerContainer = document.getElementById('header-container');
const footerContainer = document.getElementById('footer-container');
const sosButtonContainer = document.getElementById('sos-button-container');
const emergencyNotification = document.getElementById('emergency-notification');

// Emergency Warnings Mock Data
const emergencyWarnings = {
    global: "Cyclone warning for Indian Ocean.",
    locationSpecific: { "Kerala": "Heavy monsoon rains today." }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Load Components
    loadHeader();
    loadFooter();
    loadSOSButton();
    loadEmergencyNotifications();
    
    // Check Authentication Status
    checkAuthStatus();
});

// Load Header Component
async function loadHeader() {
    const { data: { user } } = await supabase.auth.getUser();
    const userData = JSON.parse(localStorage.getItem('incois_user') || '{}');
    
    headerContainer.innerHTML = `
        <nav class="site-header bg-white shadow-md">
            <div class="container mx-auto px-4 py-3">
                <div class="flex justify-between items-center">
                    <!-- Logo and Mobile Menu Toggle -->
                    <div class="flex items-center space-x-4">
                        <button id="menu-toggle" class="md:hidden p-2 rounded-md text-primary hover:bg-gray-100 focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <a href="index.html" class="flex items-center">
                            <img src="./assets/incois-logo.svg" alt="INCOIS Logo" class="h-10">
                            <span class="ml-3 text-xl font-bold text-primary">INCOIS</span>
                        </a>
                    </div>
                    
                    <!-- Desktop Navigation -->
                    <div class="hidden md:flex items-center space-x-6">
                        <a href="index.html" class="text-gray-700 hover:text-primary">Home</a>
                        <a href="profile.html" class="text-gray-700 hover:text-primary">Profile</a>
                        <a href="location.html" class="text-gray-700 hover:text-primary">Location</a>
                        <a href="report.html" class="text-gray-700 hover:text-primary">Report</a>
                        
                        ${user ? `
                            <div class="flex items-center space-x-2 ml-4">
                                <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                                    ${userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span class="text-sm font-medium">${userData?.name || 'User'}</span>
                            </div>
                        ` : `
                            <a href="login.html" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90">
                                Login / Register
                            </a>
                        `}
                    </div>
                </div>
            </div>
        </nav>
        
        <!-- Mobile Menu -->
        <div id="menu-overlay" class="menu-overlay"></div>
        <div id="mobile-menu" class="mobile-menu">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-bold text-primary">Menu</h2>
                <button id="close-menu" class="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            ${user ? `
                <div class="flex items-center space-x-3 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div class="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-medium">
                        ${userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p class="font-medium">${userData?.name || 'User'}</p>
                        <p class="text-sm text-gray-500">${userData?.phone || ''}</p>
                    </div>
                </div>
            ` : ''}
            
            <ul class="space-y-2">
                <li><a href="index.html" class="block py-3 px-4 rounded hover:bg-gray-100">Home</a></li>
                ${user ? `
                    <li><a href="profile.html" class="block py-3 px-4 rounded hover:bg-gray-100">My Profile</a></li>
                    <li><a href="location.html" class="block py-3 px-4 rounded hover:bg-gray-100">Location Preview</a></li>
                    <li><a href="report.html" class="block py-3 px-4 rounded hover:bg-gray-100">File a Report</a></li>
                    <li>
                        <button onclick="handleLogout()" class="w-full text-left py-3 px-4 rounded hover:bg-gray-100 text-red-600">
                            Logout
                        </button>
                    </li>
                ` : `
                    <li><a href="login.html" class="block py-3 px-4 rounded bg-primary text-white text-center hover:bg-opacity-90">
                        Login / Register
                    </a></li>
                `}
            </ul>
        </div>
    `;
    
    // Setup Menu Toggle with proper event delegation
    document.addEventListener('click', (e) => {
        const menuToggle = document.getElementById('menu-toggle');
        const closeMenu = document.getElementById('close-menu');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuOverlay = document.getElementById('menu-overlay');
        
        if (e.target === menuToggle || menuToggle?.contains(e.target)) {
            // Toggle menu open
            mobileMenu?.classList.add('open');
            menuOverlay?.classList.add('open');
            document.body.style.overflow = 'hidden';
            return;
        }
        
        if (e.target === closeMenu || 
            e.target === menuOverlay || 
            (mobileMenu && !mobileMenu.contains(e.target) && menuOverlay?.classList.contains('open'))) {
            // Close menu
            mobileMenu?.classList.remove('open');
            menuOverlay?.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking outside on mobile
    document.addEventListener('touchstart', (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuToggle = document.getElementById('menu-toggle');
        const menuOverlay = document.getElementById('menu-overlay');
        
        if (mobileMenu?.classList.contains('open') && 
            !mobileMenu.contains(e.target) && 
            e.target !== menuToggle && 
            !menuToggle?.contains(e.target)) {
            mobileMenu.classList.remove('open');
            menuOverlay?.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

// Load Footer Component
function loadFooter() {
    footerContainer.innerHTML = `
        <footer class="bg-primary text-white py-8">
            <div class="container mx-auto px-4">
                <div class="flex flex-col md:flex-row justify-between">
                    <div class="mb-6 md:mb-0">
                        <div class="flex items-center">
                            <img src="./assets/incois-logo-white.svg" alt="INCOIS Logo" class="h-10">
                            <span class="ml-3 text-xl font-bold">INCOIS</span>
                        </div>
                        <p class="mt-2 text-sm max-w-md">Indian National Centre for Ocean Information Services - Providing ocean information and advisory services to society.</p>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-semibold mb-3">Emergency Contact</h3>
                        <p class="text-sm">Toll Free: 1800-425-5463</p>
                        <p class="text-sm">Email: info@incois.gov.in</p>
                    </div>
                </div>
                
                <div class="mt-8 pt-4 border-t border-blue-700">
                    <p class="text-sm text-center">© ${new Date().getFullYear()} INCOIS. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
}

// Load SOS Button
function loadSOSButton() {
    sosButtonContainer.innerHTML = `
        <button id="sos-button" class="sos-button">
            <span>SOS</span>
        </button>
    `;
    
    // SOS Button Click Event
    document.getElementById('sos-button').addEventListener('click', () => {
        alert('Emergency SOS feature will be implemented in the next version.');
    });
}

// Load Emergency Notifications
function loadEmergencyNotifications() {
    if (!emergencyNotification) return;
    
    // Check if user is logged in
    const session = getSession();
    
    if (session) {
        // User is logged in, show location-specific warnings
        const userLocation = session.user.user_metadata.location;
        const locationWarning = emergencyWarnings.locationSpecific[userLocation] || emergencyWarnings.global;
        
        emergencyNotification.innerHTML = `
            <div class="emergency-pulse">
                <strong>Alert for ${userLocation}:</strong> ${locationWarning}
            </div>
        `;
    } else {
        // User is not logged in, show global warnings
        emergencyNotification.innerHTML = `
            <div class="emergency-pulse">
                <strong>Alert:</strong> ${emergencyWarnings.global}
            </div>
        `;
    }
}

// Check Authentication Status
async function checkAuthStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    const currentPath = window.location.pathname.split('/').pop();
    
    if (session) {
        // User is authenticated
        if (currentPath === 'login.html' || currentPath === '') {
            // Redirect to home if already logged in
            window.location.href = 'index.html';
        }
        
        // Update UI for authenticated user
        const authElements = document.querySelectorAll('[data-auth]');
        authElements.forEach(el => {
            if (el.dataset.auth === 'show-when-logged-out') el.style.display = 'none';
            if (el.dataset.auth === 'show-when-logged-in') el.style.display = 'block';
        });
        
        // Load user data if not already in localStorage
        const userData = JSON.parse(localStorage.getItem('incois_user') || '{}');
        if (!userData.name) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
            if (profile) {
                localStorage.setItem('incois_user', JSON.stringify({
                    name: profile.name,
                    phone: profile.phone,
                    location: profile.location
                }));
            }
        }
        
        // Reload header to show updated user info
        loadHeader();
    } else {
        // User is not authenticated
        if (currentPath !== 'login.html' && !['', 'index.html'].includes(currentPath)) {
            // Redirect to login if trying to access protected page
            window.location.href = 'login.html';
            return;
        }
        
        // Update UI for unauthenticated user
        const authElements = document.querySelectorAll('[data-auth]');
        authElements.forEach(el => {
            if (el.dataset.auth === 'show-when-logged-out') el.style.display = 'block';
            if (el.dataset.auth === 'show-when-logged-in') el.style.display = 'none';
        });
    }
}

// Get Session from localStorage
export function getSession() {
    const sessionStr = localStorage.getItem('incois_session');
    return sessionStr ? JSON.parse(sessionStr) : null;
}

// Set Session in localStorage is now exported at the top of the file

// Clear Session from localStorage
function clearSession() {
    localStorage.removeItem('incois_session');
    localStorage.removeItem('incois_user');
}

// Handle Logout
window.handleLogout = async function() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        clearSession();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
};

// Export functions for use in other modules
export {
    loadEmergencyNotifications,
    clearSession
};