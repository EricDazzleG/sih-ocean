// Profile Page JavaScript

// Import auth functions
import { getUser, signOut, updateUserData, initSupabase, getSupabase } from './auth.js';

// DOM Elements
const profileImage = document.getElementById('profile-image');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profilePhone = document.getElementById('profile-phone');
const profileLocation = document.getElementById('profile-location');
const userTypeBadge = document.getElementById('user-type-badge');
const reportsCount = document.getElementById('reports-count');
const alertsCount = document.getElementById('alerts-count');
const logoutButton = document.getElementById('logout-button');
const editProfileButton = document.getElementById('edit-profile-button');
const saveProfileButton = document.getElementById('save-profile-button');
const editForm = document.getElementById('edit-profile-form');

// Initialize Profile Page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Ensure Supabase is initialized
        await initSupabase();

        // Load user profile
        await loadUserProfile();
        
        // Setup event listeners
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
        
        if (editProfileButton) {
            editProfileButton.addEventListener('click', enableEditMode);
        }
        
        if (saveProfileButton && editForm) {
            editForm.addEventListener('submit', handleProfileUpdate);
        }
    } catch (error) {
        console.error('Error initializing profile page:', error);
        showStatusMessage('Failed to load profile. Please try again.', 'error');
    }
});

// Load user profile
async function loadUserProfile() {
    try {
        const user = await getUser();
        
        if (!user) {
            // Redirect to login if no user is found
            window.location.href = 'login.html';
            return;
        }
        
        // Display user information
        const userData = user.user_metadata || {};
        
        if (profileName) profileName.textContent = userData.name || 'N/A';
        if (profileEmail) profileEmail.textContent = user.email || 'N/A';
        if (profilePhone) profilePhone.textContent = userData.phone || 'N/A';
        if (profileLocation) profileLocation.textContent = userData.location || 'N/A';
        
        // Set user type badge
        if (userTypeBadge) {
            const userType = userData.user_type || 'user';
            userTypeBadge.textContent = userType.charAt(0).toUpperCase() + userType.slice(1);
            userTypeBadge.className = `px-2 py-1 text-xs rounded-full ${
                userType === 'admin' ? 'bg-purple-100 text-purple-800' : 
                userType === 'researcher' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'
            }`;
        }
        
        // Set profile image or initials
        if (profileImage) {
            if (userData.avatar_url) {
                profileImage.innerHTML = `<img src="${userData.avatar_url}" alt="Profile" class="w-full h-full object-cover rounded-full">`;
            } else {
                const initials = (userData.name || 'U')
                    .split(' ')
                    .map(name => name[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);
                
                profileImage.innerHTML = `<span class="text-2xl font-semibold text-white">${initials}</span>`;
                
                // Set a random background color based on user's name
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
                const colorIndex = (userData.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
                profileImage.className = `w-24 h-24 rounded-full flex items-center justify-center ${colors[colorIndex]} shadow-md`;
            }
        }
        
        // Load user statistics
        await loadUserStatistics(user.id);
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        showStatusMessage('Failed to load profile. Please try again.', 'error');
    }
}

// Load user statistics
async function loadUserStatistics(userId) {
    try {
        const supabase = getSupabase();
        
        // Get reports count
        const { data: reports, error: reportsError } = await supabase
            .from('reports')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);
        
        if (!reportsError && reportsCount) {
            // If count meta is not available, fall back to length
            const count = Array.isArray(reports) ? reports.length : (reports?.length || 0);
            reportsCount.textContent = count;
        }
        
        // Alerts count (demo)
        if (alertsCount) {
            alertsCount.textContent = Math.floor(Math.random() * 5);
        }
        
    } catch (error) {
        console.error('Error loading user statistics:', error);
    }
}

// Enable edit mode
function enableEditMode() {
    if (!editForm) return;
    
    // Populate form fields from current DOM values if user not cached
    editForm.elements['name'].value = (profileName?.textContent || '').replace('N/A','');
    editForm.elements['phone'].value = (profilePhone?.textContent || '').replace('Phone: ','').replace('N/A','');
    editForm.elements['location'].value = (profileLocation?.textContent || '').replace('Location: ','').replace('N/A','');
    
    // Toggle visibility
    document.querySelectorAll('.view-mode').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.edit-mode').forEach(el => el.classList.remove('hidden'));
}

// Handle profile update
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const updatedData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        location: formData.get('location')
    };
    
    // Show loading state
    const saveButton = form.querySelector('button[type="submit"]');
    const originalButtonText = saveButton.innerHTML;
    saveButton.disabled = true;
    saveButton.innerHTML = 'Saving...';
    
    try {
        // Update user data in Supabase Auth
        const { data, error } = await updateUserData(updatedData);
        
        if (error) throw error;
        
        // Update UI
        if (profileName) profileName.textContent = updatedData.name || 'N/A';
        if (profilePhone) profilePhone.textContent = updatedData.phone || 'N/A';
        if (profileLocation) profileLocation.textContent = updatedData.location || 'N/A';
        
        // Toggle back to view mode
        document.querySelectorAll('.view-mode').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.edit-mode').forEach(el => el.classList.add('hidden'));
        
        showStatusMessage('Profile updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showStatusMessage('Failed to update profile. Please try again.', 'error');
    } finally {
        // Reset button state
        saveButton.disabled = false;
        saveButton.innerHTML = originalButtonText;
    }
}

// Handle logout
async function handleLogout() {
    try {
        await signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error during logout:', error);
        showStatusMessage('Failed to log out. Please try again.', 'error');
    }
}

// Local status message helper
function showStatusMessage(message, type = 'info') {
    // Optionally attach to a status element if you add one to the page
    console.log(`[Profile] ${type}:`, message);
}