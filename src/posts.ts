// src/lib/posts.js
import { supabase } from "./lib/supabaseClient.ts";

// ✅ Get all posts
export async function getPosts() {
    const { data, error } = await supabase.from("posts").select("*");
    if (error) throw error;
    return data;
}

// ✅ Insert new post
export async function addPost(userId, title, content) {
    const { data, error } = await supabase
        .from("posts")
        .insert([{ user_id: userId, title, content }])
        .select();
    if (error) throw error;
    return data[0];
}

// ✅ Delete post
export async function deletePost(id) {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw error;
}
