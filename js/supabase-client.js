// Supabase client initialization

const SUPABASE_CONFIG = {
    url: 'https://qghpvjhaqrzkigxpbjte.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnaHB2amhhcXJ6a2lneHBianRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MjQ2ODksImV4cCI6MjA4MzQwMDY4OX0.Nu_XWzaFXXBotI-TOTu_OO6nbS96lxasJwfYSIBwBAI'
};

// Supabase client (will be initialized when Supabase JS loads)
let supabaseClient = null;

/**
 * Initialize Supabase client
 */
function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase library not loaded');
        return false;
    }

    supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('Supabase client initialized');
    return true;
}

/**
 * Get current user
 */
async function getCurrentUser() {
    if (!supabaseClient) return null;

    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
        // AuthSessionMissingError is expected when not signed in - don't log it
        if (error.name !== 'AuthSessionMissingError') {
            console.error('Error getting user:', error);
        }
        return null;
    }
    return user;
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated() {
    const user = await getCurrentUser();
    return user !== null;
}
