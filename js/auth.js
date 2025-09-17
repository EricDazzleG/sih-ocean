// Auth utilities
const SUPABASE_URL = 'https://uxculnxvfukuiczadoqz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Y3Vsbnh2ZnVrdWljemFkb3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTc3OTEsImV4cCI6MjA3MzY5Mzc5MX0.YebX841KOKE2PP_DChIV70vHr3H4xTdHqxbDOx9C89M';

// Internal holder for the client instance
let supabaseClient = null;

// Initialize Supabase client exactly once
export async function initSupabase() {
    if (supabaseClient) return supabaseClient;

    try {
        // If the Supabase library is already loaded via CDN, use it to create the client
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            console.log('Creating client using global Supabase library');
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
                auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
            });
            // Expose for debugging only
            window.supabaseClient = supabaseClient;
            return supabaseClient;
        }

        // Otherwise, load the ESM client and create it
        console.log('Loading Supabase ESM client');
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
        });
        // Expose for debugging only
        window.supabaseClient = supabaseClient;
        return supabaseClient;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        throw error;
    }
}

// Get Supabase instance (must call initSupabase() first)
export function getSupabase() {
    if (supabaseClient) return supabaseClient;
    throw new Error('Supabase not initialized. Call initSupabase() first.');
}

// Session helpers
export async function getSession() {
    const client = supabaseClient || await initSupabase();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
}

export async function getUser() {
    const client = supabaseClient || await initSupabase();
    const { data, error } = await client.auth.getUser();
    if (error) throw error;
    return data.user;
}

// Auth helpers
export async function signUp(email, password, userData) {
    const client = supabaseClient || await initSupabase();
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { data: userData, emailRedirectTo: `${window.location.origin}/login.html` }
    });
    if (error) throw error;
    return data;
}

export async function signIn(email, password) {
    const client = supabaseClient || await initSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const client = supabaseClient || await initSupabase();
    const { error } = await client.auth.signOut();
    if (error) throw error;
}

export async function updateUserData(userData) {
    const client = supabaseClient || await initSupabase();
    const { data, error } = await client.auth.updateUser({ data: userData });
    if (error) throw error;
    return data;
}

export async function resetPassword(email) {
    const client = supabaseClient || await initSupabase();
    const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`
    });
    if (error) throw error;
    return data;
}
