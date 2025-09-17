// Register Page JavaScript

// Import Supabase from CDN (fallback if module import fails)
let supabase;

// Debug: Log script loading
console.log('Register script loaded');

// Try to get Supabase from window object first
if (window.supabase) {
    supabase = window.supabase;
    console.log('Using window.supabase');
} 
// If not in window, try to import from app.js
else {
    try {
        import('./app.js').then(module => {
            if (module.supabase) {
                supabase = module.supabase;
                console.log('Using imported supabase from app.js');
            }
        }).catch(err => {
            console.error('Failed to import app.js:', err);
        });
    } catch (err) {
        console.error('Error importing app.js:', err);
    }
}

console.log('Supabase instance:', supabase);

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

// Show error message helper
function showError(message) {
    const statusEl = document.getElementById('status-message');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = 'error';
        statusEl.style.display = 'block';
    }
    console.error(message);
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    // Check if Supabase is initialized
    if (!supabase) {
        showError('Error: Supabase client not initialized. Please refresh the page and try again.');
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    console.log('Form submitted');
    
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
        console.log('Starting registration process...');
        
        // 1. Create user in Supabase Auth
        console.log('Calling supabase.auth.signUp with:', { email, password, name, phone, userType });
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    phone,
                    user_type: userType,
                    location
                },
                emailRedirectTo: window.location.origin + '/login.html'
            }
        });
        
        console.log('Auth response:', { authData, authError });
        
        if (authError) {
            console.error('Auth error details:', {
                name: authError.name,
                message: authError.message,
                status: authError.status
            });
            throw authError;
        }
        
        if (!authData.user) {
            throw new Error('No user data returned from auth');
        }
        
        console.log('User created successfully:', authData.user.id);
        
        // 2. Manually insert into profiles table (in case trigger didn't work)
        console.log('Attempting to insert profile data...');
        
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email,
                name,
                phone,
                location,
                user_type: userType
            })
            .select();
            
        console.log('Profile insert response:', { profileData, profileError });
            
        if (profileError) {
            console.error('Profile insert error:', profileError);
            // Try to continue even if profile insert fails, as the trigger might have worked
            if (!profileError.message.includes('duplicate key')) {
                throw profileError;
            }
        }
        
        // Show success message
        const successMessage = 'Registration successful! ' + 
            (authData.session ? 'You are now logged in.' : 'Please check your email to confirm your account.');
            
        showStatusMessage(successMessage, 'success');
        
        // If user is already logged in, redirect to home, otherwise to login
        if (authData.session) {
            console.log('User is logged in, redirecting to home...');
            window.location.href = 'index.html';
        } else {
            console.log('Email confirmation required, redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        
        // More specific error messages
        let errorMessage = 'An error occurred during registration';
        
        if (error.message.includes('already registered')) {
            errorMessage = 'This email is already registered. Please log in instead.';
        } else if (error.message.includes('password')) {
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
