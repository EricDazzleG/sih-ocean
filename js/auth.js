// Auth utilities for handling user authentication
import { supabase } from './app.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs@2.4.3/dist/bcrypt.min.js';

// Generate a salt and hash the password
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

// Verify password against hash
export async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Register a new user
export async function registerUser(email, password, userData) {
    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Insert new user
        const { data: user, error } = await supabase
            .from('profiles')
            .insert([
                {
                    email,
                    password_hash: hashedPassword,
                    name: userData.name,
                    phone: userData.phone,
                    location: userData.location
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return { user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

// Login user
export async function loginUser(email, password) {
    try {
        // Get user by email
        const { data: user, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Set session in localStorage
        const session = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        };

        localStorage.setItem('incois_session', JSON.stringify(session));
        localStorage.setItem('incois_user', JSON.stringify(user));

        return { user, error: null };
    } catch (error) {
        return { user: null, error: error.message };
    }
}

// Logout user
export function logoutUser() {
    localStorage.removeItem('incois_session');
    localStorage.removeItem('incois_user');
    window.location.href = 'login.html';
}

// Check if user is authenticated
export function isAuthenticated() {
    const session = JSON.parse(localStorage.getItem('incois_session') || 'null');
    return session && session.expires_at > Date.now();
}

// Get current user
export function getCurrentUser() {
    return JSON.parse(localStorage.getItem('incois_user') || 'null');
}
