// Import necessary modules
import { supabase } from './app.js';
import { setSession } from './auth.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const statusMessage = document.getElementById('status-message');
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const detectLocationBtn = document.getElementById('detect-location');
    const locationInput = document.getElementById('location');

    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = togglePassword.querySelector('svg');
            if (type === 'text') {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                `;
            } else {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                `;
            }
        });
    }

    // Detect user's location
    if (detectLocationBtn && locationInput) {
        detectLocationBtn.addEventListener('click', () => {
            if (!navigator.geolocation) {
                showStatus('Geolocation is not supported by your browser', 'error');
                return;
            }

            detectLocationBtn.disabled = true;
            detectLocationBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Detecting...
            `;

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        // Use OpenStreetMap's Nominatim service for reverse geocoding
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1`
                        );
                        const data = await response.json();
                        
                        // Extract location details
                        const address = data.address;
                        let location = '';
                        
                        // Try to get the most specific location available
                        if (address.city) {
                            location = `${address.city}, ${address.state || address.country}`;
                        } else if (address.town) {
                            location = `${address.town}, ${address.state || address.country}`;
                        } else if (address.village) {
                            location = `${address.village}, ${address.state || address.country}`;
                        } else if (address.county) {
                            location = `${address.county}, ${address.state || address.country}`;
                        } else {
                            location = address.state || address.country || 'Unknown location';
                        }
                        
                        locationInput.value = location;
                        showStatus('Location detected successfully!', 'success');
                    } catch (error) {
                        console.error('Error getting location name:', error);
                        locationInput.value = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                        showStatus('Location detected, but could not get location name', 'warning');
                    } finally {
                        detectLocationBtn.disabled = false;
                        detectLocationBtn.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span class="hidden sm:inline">Detect</span>
                        `;
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    showStatus('Unable to retrieve your location. Please enter it manually.', 'error');
                    detectLocationBtn.disabled = false;
                    detectLocationBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span class="hidden sm:inline">Detect</span>
                    `;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    // Handle form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(registerForm);
            const formValues = Object.fromEntries(formData.entries());
            
            // Validate form
            if (!validateForm(formValues)) {
                return;
            }
            
            // Show loading state
            const submitButton = registerForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
            `;
            
            try {
                // Check if username is already taken
                const { data: existingUser, error: userError } = await supabase
                    .from('profiles')
                    .select('id')
                    .or(`username.eq.${formValues.username},email.eq.${formValues.email}`)
                    .single();
                
                if (existingUser) {
                    throw new Error('Username or email already exists');
                }
                
                // Create user in database
                const { data: newUser, error: insertError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            username: formValues.username,
                            email: formValues.email,
                            name: formValues.name,
                            location: formValues.location,
                            password_hash: await hashPassword(formValues.password)
                        }
                    ])
                    .select()
                    .single();
                
                if (insertError) {
                    throw insertError;
                }
                
                // Create session
                const session = {
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        username: newUser.username
                    },
                    expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
                };
                
                // Save session
                setSession(session);
                
                // Show success message
                showStatus('Account created successfully! Redirecting...', 'success');
                
                // Redirect to home page after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
                
            } catch (error) {
                console.error('Registration error:', error);
                showStatus(error.message || 'An error occurred during registration. Please try again.', 'error');
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }
    
    // Form validation
    function validateForm(formData) {
        // Reset previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        let isValid = true;
        
        // Validate name
        if (!formData.name || formData.name.trim().length < 2) {
            showFieldError('name', 'Please enter your full name');
            isValid = false;
        }
        
        // Validate username
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!formData.username || !usernameRegex.test(formData.username)) {
            showFieldError('username', 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate password
        if (!formData.password || formData.password.length < 8) {
            showFieldError('password', 'Password must be at least 8 characters long');
            isValid = false;
        }
        
        // Validate password confirmation
        if (formData.password !== formData['confirm-password']) {
            showFieldError('confirm-password', 'Passwords do not match');
            isValid = false;
        }
        
        // Validate location
        if (!formData.location || formData.location.trim().length < 2) {
            showFieldError('location', 'Please enter your location');
            isValid = false;
        }
        
        // Validate terms acceptance
        if (!formData.terms) {
            showStatus('You must accept the terms and conditions to continue', 'error');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show error message for a specific field
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        // Check if error message already exists
        if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
            field.nextElementSibling.textContent = message;
            return;
        }
        
        const errorElement = document.createElement('p');
        errorElement.className = 'mt-1 text-sm text-red-600 error-message';
        errorElement.textContent = message;
        
        // Insert after the input field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        // Add error class to input
        field.classList.add('border-red-500');
        field.classList.add('focus:ring-red-500');
        field.classList.remove('focus:ring-primary');
        field.classList.remove('focus:border-primary');
        
        // Remove error class on input
        field.addEventListener('input', function clearError() {
            errorElement.remove();
            field.classList.remove('border-red-500');
            field.classList.remove('focus:ring-red-500');
            field.classList.add('focus:ring-primary');
            field.classList.add('focus:border-primary');
            field.removeEventListener('input', clearError);
        });
    }
    
    // Show status message
    function showStatus(message, type = 'info') {
        if (!statusMessage) return;
        
        // Set message and type
        statusMessage.textContent = message;
        statusMessage.className = ''; // Reset classes
        
        // Add type-specific classes
        switch (type) {
            case 'success':
                statusMessage.classList.add('bg-green-100', 'text-green-700');
                break;
            case 'error':
                statusMessage.classList.add('bg-red-100', 'text-red-700');
                break;
            case 'warning':
                statusMessage.classList.add('bg-yellow-100', 'text-yellow-700');
                break;
            default:
                statusMessage.classList.add('bg-blue-100', 'text-blue-700');
        }
        
        // Add common classes
        statusMessage.classList.add('p-3', 'rounded-md', 'text-sm');
        statusMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                statusMessage.classList.add('hidden');
            }, 5000);
        }
    }
    
    // Hash password using bcrypt
    async function hashPassword(password) {
        // Load bcrypt if not already loaded
        if (typeof bcrypt === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js');
        }
        
        // Generate salt and hash
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }
    
    // Load script dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
});
