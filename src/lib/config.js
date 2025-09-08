// src/lib/config.js

// Backend API (Express/Vercel)
export const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

// Supabase
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("❌ Missing Supabase env vars. Check .env.local");
}
