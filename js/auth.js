// Auth utilities
const SUPABASE_URL = 'https://uxculnxvfukuiczadoqz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Y3Vsbnh2ZnVrdWljemFkb3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTc3OTEsImV4cCI6MjA3MzY5Mzc5MX0.YebX841KOKE2PP_DChIV70vHr3H4xTdHqxbDOx9C89M';

// Initialize Supabase
export async function initSupabase() {
    try {
        // If already initialized, return the existing instance
        if (window.supabase) {
            console.log('Using existing window.supabase instance');
            return window.supabase;
        }

        // Load Supabase client
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        
        // Create and store the client
        const client = createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Make it globally available
        window.supabase = client;
        
        console.log('Supabase initialized successfully');
        return client;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        throw error;
    }
}

// Get Supabase instance
export function getSupabase() {
    if (window.supabase) {
        return window.supabase;
    }
    throw new Error('Supabase not initialized. Call initSupabase() first.');
}

// Self-initialize when this module is imported
(async () => {
    try {
        await initSupabase();
    } catch (error) {
        console.error('Auto-initialization failed:', error);
    }
})();
