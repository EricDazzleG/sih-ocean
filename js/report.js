// Report Page JavaScript

// Use auth helpers instead of app.js local session
import { initSupabase, getSupabase, getSession } from './auth.js';

// DOM Elements
const reportForm = document.getElementById('report-form');
const detectLocationBtn = document.getElementById('detect-location');
const locationInput = document.getElementById('location');
const mediaInput = document.getElementById('media');
const imagePreview = document.getElementById('image-preview');
const videoPreview = document.getElementById('video-preview');
const previewContainer = document.getElementById('preview');
const statusMessage = document.getElementById('status-message');

// Initialize Report Page
document.addEventListener('DOMContentLoaded', async () => {
    // Ensure Supabase is ready
    await initSupabase();
    const supabase = getSupabase();

    // Check Authentication using Supabase Auth
    const session = await getSession();
    if (!session) {
        // Save intended destination so we can return after login (app.js also handles this)
        try { localStorage.setItem('post_login_redirect', 'report.html'); } catch {}
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Setup Form Submission
    if (reportForm) {
        reportForm.addEventListener('submit', (e) => handleReportSubmission(e, supabase, session));
    }
    
    // Setup Detect Location Button
    if (detectLocationBtn) {
        detectLocationBtn.addEventListener('click', detectLocation);
    }
    
    // Setup Media Preview
    if (mediaInput) {
        mediaInput.addEventListener('change', handleMediaPreview);
    }
});

// Handle Report Form Submission
async function handleReportSubmission(event, supabase, session) {
    event.preventDefault();
    
    if (!session) {
        showStatus('You must be logged in to submit a report.', 'error');
        return;
    }
    
    // Get form data
    const location = document.getElementById('location').value;
    const tag = document.getElementById('tag').value;
    const message = document.getElementById('message').value;
    const media = document.getElementById('media').files[0];
    
    // Validate form data
    if (!location || !tag) {
        showStatus('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    showStatus('Submitting your report...', 'loading');
    
    try {
        // Prepare report data
        const reportData = {
            user_id: session.user.id,
            location,
            tag,
            message: message || null,
            created_at: new Date().toISOString(),
            status: 'pending'
        };
        
        // Upload media if provided (placeholder for real upload)
        if (media) {
            const fileExt = media.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `reports/${session.user.id}/${fileName}`;
            // TODO: supabase.storage.from('reports').upload(filePath, media)
            reportData.media_url = filePath;
        }
        
        // Submit report to Supabase
        const { data, error } = await supabase
            .from('reports')
            .insert([reportData])
            .select();
        
        if (error) throw error;
        
        // Show success message
        showStatus('Report submitted successfully!', 'success');
        
        // Reset form
        reportForm.reset();
        if (previewContainer) previewContainer.classList.add('hidden');
        
        // Redirect to home page after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting report:', error);
        showStatus('An error occurred. Please try again.', 'error');
    }
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

// Handle Media Preview
function handleMediaPreview(event) {
    const file = event.target.files[0];
    
    if (!file) {
        if (previewContainer) previewContainer.classList.add('hidden');
        return;
    }
    
    // Show preview container
    if (previewContainer) previewContainer.classList.remove('hidden');
    
    // Check file type
    if (file.type.startsWith('image/')) {
        // Image file
        imagePreview.classList.remove('hidden');
        videoPreview.classList.add('hidden');
        
        // Create object URL and set as image source
        const objectUrl = URL.createObjectURL(file);
        imagePreview.src = objectUrl;
        
    } else if (file.type.startsWith('video/')) {
        // Video file
        videoPreview.classList.remove('hidden');
        imagePreview.classList.add('hidden');
        
        // Create object URL and set as video source
        const objectUrl = URL.createObjectURL(file);
        videoPreview.src = objectUrl;
        
    } else {
        // Unsupported file type
        if (previewContainer) previewContainer.classList.add('hidden');
        showStatus('Unsupported file type. Please upload an image or video.', 'error');
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