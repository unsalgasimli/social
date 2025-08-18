// src/lib/auth.js
import { supabase } from "./lib/supabaseClient.ts";

// ✅ Sign up new user
export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

// ✅ Login user
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
}

// ✅ Logout
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// ✅ Get current user
export async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}
