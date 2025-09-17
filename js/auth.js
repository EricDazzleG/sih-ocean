// Auth utilities
let supabase;

// Initialize Supabase
export async function initSupabase() {
    if (window.supabase) {
        supabase = window.supabase;
        console.log('Using window.supabase');
        return supabase;
    }
    
    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        supabase = createClient(
            'https://uxculnxvfukuiczadoqz.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Y3Vsbnh2ZnVrdWljemFkb3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTc3OTEsImV4cCI6MjA3MzY5Mzc5MX0.YebX841KOKE2PP_DChIV70vHr3H4xTdHqxbDOx9C89M'
        );
        window.supabase = supabase;
        console.log('Supabase initialized via ESM');
        return supabase;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        throw error;
    }
}

// Get Supabase instance
export function getSupabase() {
    if (!supabase) {
        throw new Error('Supabase not initialized. Call initSupabase() first.');
    }
    return supabase;
}
