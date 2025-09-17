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
        const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        
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

// Get current session
export async function getSession() {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) throw error;
    return data.session;
}

// Get current user
export async function getUser() {
    const { data, error } = await getSupabase().auth.getUser();
    if (error) throw error;
    return data.user;
}

// Sign up with email and password
export async function signUp(email, password, userData) {
    const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
            data: userData,
            emailRedirectTo: `${window.location.origin}/login.html`
        }
    });
    
    if (error) throw error;
    return data;
}

// Sign in with email and password
export async function signIn(email, password) {
    const { data, error } = await getSupabase().auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    return data;
}

// Sign out
export async function signOut() {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
}

// Update user data
export async function updateUserData(userData) {
    const { data, error } = await getSupabase().auth.updateUser({
        data: userData
    });
    
    if (error) throw error;
    return data;
}

// Reset password
export async function resetPassword(email) {
    const { data, error } = await getSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`
    });
    
    if (error) throw error;
    return data;
}

// Self-initialize when this module is imported
(async () => {
    try {
        await initSupabase();
    } catch (error) {
        console.error('Auto-initialization failed:', error);
    }
})();
