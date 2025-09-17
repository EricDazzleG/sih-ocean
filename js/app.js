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

// Get session from localStorage
export function getSession() {
    const session = localStorage.getItem('incois_session');
    return session ? JSON.parse(session) : null;
}

// Clear session from localStorage
export function clearSession() {
    localStorage.removeItem('incois_session');
    localStorage.removeItem('incois_user');
}

// DOM Elements
const headerContainer = document.getElementById('header-container');
const footerContainer = document.getElementById('footer-container');
const sosButtonContainer = document.getElementById('sos-button-container');
const emergencyNotification = document.getElementById('emergency-notification');

// Emergency Warnings Mock Data
const emergencyWarnings = {
    global: "Cyclone warning for Indian Ocean.",
    locationSpecific: { 
        "Kerala": "Heavy monsoon rains today.",
        "Tamil Nadu": "High waves expected along the coast.",
        "Andhra Pradesh": "Fishermen advised not to venture into the sea.",
        "Odisha": "Cyclone alert issued for coastal areas.",
        "West Bengal": "Heavy rainfall expected in the next 24 hours.",
        "Gujarat": "Rough sea conditions expected."
    }
};

// Check if current page is public (doesn't require authentication)
const publicPages = ['login.html', 'index.html', ''];
const currentPage = window.location.pathname.split('/').pop() || '';

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication status first
    const isAuthRequired = !publicPages.includes(currentPage);
    const isAuthenticated = await checkAuthStatus();
    
    if (isAuthRequired && !isAuthenticated) {
        // Redirect to login if authentication is required but user is not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Load Components
    loadHeader();
    loadFooter();
    loadSOSButton();
    loadEmergencyNotifications();
});

// Toggle mobile menu
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    
    if (mobileMenu && mobileToggle) {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        mobileMenu.classList.toggle('hidden');
        
        // Toggle body scroll
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    }
}

// Close mobile menu when clicking outside
function closeMobileMenuOnClickOutside(event) {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    
    if (mobileMenu && !mobileMenu.contains(event.target) && 
        mobileToggle && !mobileToggle.contains(event.target) &&
        !mobileMenu.classList.contains('hidden')) {
        toggleMobileMenu();
    }
}

// Close mobile menu when clicking on a link
function closeMobileMenuOnLinkClick() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = mobileMenu?.querySelectorAll('a[href]');
    
    if (mobileLinks) {
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('hidden')) {
                    toggleMobileMenu();
                }
            });
        });
    }
}

// Load Header Component
async function loadHeader() {
    const session = getSession();
    const user = session ? await getUserProfile(session.user.id) : null;
    
    headerContainer.innerHTML = `
        <header class="site-header">
            <div class="nav-container">
                <!-- Logo -->
                <a href="index.html" class="logo">
                    <img src="./assets/incois-logo.svg" alt="INCOIS Logo">
                    <span>INCOIS</span>
                </a>
                
                <!-- Desktop Navigation -->
                <nav class="desktop-nav">
                    <a href="index.html" class="text-gray-700 hover:text-primary">Home</a>
                    <a href="profile.html" class="text-gray-700 hover:text-primary" data-auth="show-when-logged-in">Profile</a>
                    <a href="location.html" class="text-gray-700 hover:text-primary">Location</a>
                    <a href="report.html" class="text-gray-700 hover:text-primary" data-auth="show-when-logged-in">Report</a>
                    
                    ${user ? `
                        <div class="user-profile" data-auth="show-when-logged-in">
                            <div class="user-avatar">
                                ${user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span class="hidden md:inline">${user.name || 'User'}</span>
                        </div>
                    ` : `
                        <a href="login.html" class="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90" data-auth="show-when-logged-out">
                            Login / Register
                        </a>
                    `}
                </nav>
                
                <!-- Mobile Navigation Toggle -->
                <button class="mobile-nav-toggle" aria-label="Toggle menu" aria-expanded="false">
                    <span class="sr-only">Open main menu</span>
                    <div class="hamburger">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </div>
                </button>
                
                <!-- Mobile Menu -->
                <div class="mobile-menu hidden fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50 p-6 transform transition-transform duration-300 ease-in-out">
                    <div class="flex flex-col h-full">
                        <div class="flex justify-between items-center mb-8">
                            <a href="index.html" class="logo flex items-center">
                                <img src="./assets/incois-logo.svg" alt="INCOIS Logo" class="h-8">
                                <span class="ml-2 text-lg font-semibold text-primary">INCOIS</span>
                            </a>
                            <button class="mobile-close" aria-label="Close menu">
                                &times;
                            </button>
                        </div>
                        
                        <nav class="flex-1 flex flex-col space-y-4">
                            <a href="index.html" class="text-gray-700 hover:text-primary py-2">Home</a>
                            <a href="profile.html" class="text-gray-700 hover:text-primary py-2" data-auth="show-when-logged-in">Profile</a>
                            <a href="location.html" class="text-gray-700 hover:text-primary py-2">Location</a>
                            <a href="report.html" class="text-gray-700 hover:text-primary py-2" data-auth="show-when-logged-in">Report</a>
                            
                            ${user ? `
                                <div class="mt-auto pt-4 border-t border-gray-200">
                                    <div class="flex items-center space-x-3">
                                        <div class="user-avatar">
                                            ${user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-900">${user.name || 'User'}</p>
                                            <button onclick="handleLogout()" class="text-sm text-primary hover:underline">
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <div class="mt-auto pt-4 border-t border-gray-200" data-auth="show-when-logged-out">
                                    <a href="login.html" class="block w-full text-center bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90">
                                        Login / Register
                                    </a>
                                </div>
                            `}
                        </nav>
                    </div>
                </div>
                
                <!-- Overlay -->
                <div class="mobile-menu-overlay hidden fixed inset-0 bg-black bg-opacity-50 z-40"></div>
            </div>
        </header>
    `;
    
    // Add event listeners after the header is loaded
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileClose = document.querySelector('.mobile-close');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMenu);
    }
    
    if (mobileClose) {
        mobileClose.addEventListener('click', toggleMobileMenu);
    }
    
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', toggleMobileMenu);
    }
    
    // Close menu when clicking on links
    closeMobileMenuOnLinkClick();
    
    // Close menu when clicking outside
    document.addEventListener('click', closeMobileMenuOnClickOutside);
    
    // Update UI based on auth status
    updateAuthUI(!!user);
}

// Get user profile from database
async function getUserProfile(userId) {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) throw error;
        return profile;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
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
    const session = getSession();
    
    if (session && session.expires_at > Date.now()) {
        // Session is valid
        const currentPath = window.location.pathname.split('/').pop() || '';
        
        if (publicPages.includes(currentPath) && currentPath !== 'index.html') {
            // Redirect to home if trying to access public pages (except index) while logged in
            window.location.href = 'index.html';
        }
        
        // Update UI for authenticated user
        updateAuthUI(true);
        return true;
    } else {
        // Session is invalid or expired
        clearSession();
        updateAuthUI(false);
        return false;
    }
}

// Update UI based on authentication status
function updateAuthUI(isAuthenticated) {
    const authElements = document.querySelectorAll('[data-auth]');
    authElements.forEach(el => {
        if (el.dataset.auth === 'show-when-logged-out') {
            el.style.display = isAuthenticated ? 'none' : 'block';
        }
        if (el.dataset.auth === 'show-when-logged-in') {
            el.style.display = isAuthenticated ? 'block' : 'none';
        }
    });
}

// Get Session from localStorage
export function getSession() {
    const sessionStr = localStorage.getItem('incois_session');
    return sessionStr ? JSON.parse(sessionStr) : null;
}

// Clear Session from localStorage
function clearSession() {
    localStorage.removeItem('incois_session');
    localStorage.removeItem('incois_user');
}

// Handle Logout
window.handleLogout = function() {
    // Clear session and redirect to login
    clearSession();
    window.location.href = 'login.html';
}

// Export functions for use in other modules
export {
    loadEmergencyNotifications,
    clearSession
};