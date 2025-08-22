// routes/profile.js
// This file defines the Express router for profile-related endpoints.
// It handles fetching, updating profiles, and creating posts, with JWT verification for authentication.
// Best practices applied: Input validation, error handling, consistent response formats.

import express from "express";
import { supabase } from "../lib/supabaseClient.js"; // Supabase client for database operations
import { verifyJWT } from "../middleware/auth.js"; // Middleware for JWT authentication

const router = express.Router();

/**
 * GET /api/profile
 * Fetches the authenticated user's profile and their posts.
 * If no profile exists, creates a default one.
 * @returns {Object} JSON response with profile and posts
 */
router.get("/", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user.id;

        // Fetch profile with joined user data
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select(`
        *,
        user:users(name, surname, email, phone, age, gender)
      `)
            .eq("user_id", user_id)
            .single();

        // Handle no profile case by auto-creating one
        if (profileError || !profile) {
            if (profileError?.code === "PGRST116") { // Supabase error code for no rows found
                const { data: newProfile, error: createError } = await supabase
                    .from("profiles")
                    .insert({
                        user_id,
                        bio: "",
                        spotify_link: null,
                        letterboxd_link: null,
                        communities: [],
                    })
                    .select(`
            *,
            user:users(name, surname, email, phone, age, gender)
          `)
                    .single();

                if (createError) {
                    console.error("Create profile error:", createError);
                    return res.status(500).json({ success: false, error: "Failed to create profile" });
                }
                return res.json({ success: true, profile: newProfile, posts: [] });
            }
            console.error("Profile fetch error:", profileError);
            return res.status(500).json({ success: false, error: "Failed to fetch profile" });
        }

        // Fetch user's posts, ordered by creation date descending
        const { data: posts, error: postsError } = await supabase
            .from("posts")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false });

        if (postsError) {
            console.error("Posts fetch error:", postsError);
            return res.status(500).json({ success: false, error: "Failed to fetch posts" });
        }

        res.json({ success: true, profile, posts: posts || [] });
    } catch (err) {
        console.error("Unexpected error in GET /profile:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * PUT /api/profile
 * Updates the authenticated user's profile with validated fields.
 * @param {Object} req.body - Fields to update (bio, spotify_link, letterboxd_link, communities)
 * @returns {Object} JSON response with updated profile
 */
router.put("/", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { bio, spotify_link, letterboxd_link, communities } = req.body;

        // Validate and sanitize input to prevent invalid updates
        const updatedData = {};
        if (bio !== undefined && typeof bio === "string") updatedData.bio = bio;
        if (spotify_link !== undefined && (typeof spotify_link === "string" || spotify_link === null))
            updatedData.spotify_link = spotify_link;
        if (letterboxd_link !== undefined && (typeof letterboxd_link === "string" || letterboxd_link === null))
            updatedData.letterboxd_link = letterboxd_link;
        if (communities !== undefined && Array.isArray(communities)) updatedData.communities = communities;

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ success: false, error: "No valid fields to update" });
        }

        // Perform the update and fetch the updated profile
        const { data, error } = await supabase
            .from("profiles")
            .update(updatedData)
            .eq("user_id", user_id)
            .select(`
        *,
        user:users(name, surname, email, phone, age, gender)
      `)
            .single();

        if (error) {
            console.error("Update profile error:", error);
            return res.status(500).json({ success: false, error: "Failed to update profile" });
        }

        res.json({ success: true, profile: data });
    } catch (err) {
        console.error("Unexpected error in PUT /profile:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * POST /api/profile/posts
 * Creates a new post for the authenticated user.
 * @param {Object} req.body - Post data (content, category)
 * @returns {Object} JSON response with created post
 */
router.post("/posts", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { content, category } = req.body;

        // Validate required fields
        if (!content || typeof content !== "string") {
            return res.status(400).json({ success: false, error: "Content is required and must be a string" });
        }
        if (category && !["General", "Music", "Film", "Books"].includes(category)) {
            return res.status(400).json({ success: false, error: "Invalid category" });
        }

        // Insert the new post
        const { data, error } = await supabase
            .from("posts")
            .insert([{ user_id, content, category: category || "General" }])
            .select()
            .single();

        if (error) {
            console.error("Create post error:", error);
            return res.status(500).json({ success: false, error: "Failed to create post" });
        }

        res.status(201).json({ success: true, post: data });
    } catch (err) {
        console.error("Unexpected error in POST /posts:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;