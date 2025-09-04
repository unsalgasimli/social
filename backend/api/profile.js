// routes/profile.js
// Defines profile-related endpoints for fetching profiles, updating profiles, and creating posts.
// Uses JWT verification and integrates with Supabase for database operations.
// Best practices: Input validation, consistent responses, error logging.

import express from "express";
import { supabase } from "../lib/supabaseClient.js";
import { verifyJWT } from "/backend/api/verifyJWT.js";

const router = express.Router();

/**
 * GET /api/profile
 * Fetches the authenticated user's profile and posts.
 * Auto-creates a profile if none exists.
 * @returns {Object} JSON with profile and posts
 */
router.get("/", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user.id;

        // Fetch profile with user data
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select(`
        *,
        user:users(name, surname, email, phone, age, gender)
      `)
            .eq("user_id", user_id)
            .single();

        // Handle no profile case
        if (profileError || !profile) {
            if (profileError?.code === "PGRST116") {
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

        // Fetch posts
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
 * @param {Object} req.body - Fields to update (bio, spotify_link, letterboxd_link, communities, etc.)
 * @returns {Object} JSON with updated profile
 */
router.put("/", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { bio, spotify_link, letterboxd_link, communities, country, city, university, faculty, school, work, field, interests, hobbies, social_links, relationship_status, optional_links, music_links, film_links, serial_links } = req.body;

        // Validate and sanitize input
        const updatedData = {};
        if (bio !== undefined && typeof bio === "string") updatedData.bio = bio;
        if (spotify_link !== undefined && (typeof spotify_link === "string" || spotify_link === null))
            updatedData.spotify_link = spotify_link;
        if (letterboxd_link !== undefined && (typeof letterboxd_link === "string" || letterboxd_link === null))
            updatedData.letterboxd_link = letterboxd_link;
        if (communities !== undefined && Array.isArray(communities)) updatedData.communities = communities;
        if (country !== undefined && typeof country === "string") updatedData.country = country;
        if (city !== undefined && typeof city === "string") updatedData.city = city;
        if (university !== undefined && typeof university === "string") updatedData.university = university;
        if (faculty !== undefined && typeof faculty === "string") updatedData.faculty = faculty;
        if (school !== undefined && typeof school === "string") updatedData.school = school;
        if (work !== undefined && typeof work === "string") updatedData.work = work;
        if (field !== undefined && typeof field === "string") updatedData.field = field;
        if (interests !== undefined && Array.isArray(interests)) updatedData.interests = interests;
        if (hobbies !== undefined && Array.isArray(hobbies)) updatedData.hobbies = hobbies;
        if (social_links !== undefined && typeof social_links === "object") updatedData.social_links = social_links;
        if (relationship_status !== undefined && typeof relationship_status === "string") updatedData.relationship_status = relationship_status;
        if (optional_links !== undefined && typeof optional_links === "object") updatedData.optional_links = optional_links;
        if (music_links !== undefined && Array.isArray(music_links)) updatedData.music_links = music_links;
        if (film_links !== undefined && Array.isArray(film_links)) updatedData.film_links = film_links;
        if (serial_links !== undefined && Array.isArray(serial_links)) updatedData.serial_links = serial_links;

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ success: false, error: "No valid fields to update" });
        }

        // Update profile
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
 * Creates a new post with optional media, tags, and links.
 * @param {Object} req.body - Post data (content, category, media, comments_enabled, tagged_users, tagged_communities, links)
 * @returns {Object} JSON with created post
 */
router.post("/posts", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user.id;
        const { content, category, media, comments_enabled, tagged_users, tagged_communities, links } = req.body;

        // Validate required fields
        if (!content || typeof content !== "string") {
            return res.status(400).json({ success: false, error: "Content is required and must be a string" });
        }
        if (category && !["General", "Music", "Film", "Books"].includes(category)) {
            return res.status(400).json({ success: false, error: "Invalid category" });
        }
        if (comments_enabled !== undefined && typeof comments_enabled !== "boolean") {
            return res.status(400).json({ success: false, error: "Comments_enabled must be a boolean" });
        }
        if (tagged_users && !Array.isArray(tagged_users)) {
            return res.status(400).json({ success: false, error: "Tagged_users must be an array of UUIDs" });
        }
        if (tagged_communities && !Array.isArray(tagged_communities)) {
            return res.status(400).json({ success: false, error: "Tagged_communities must be an array of UUIDs" });
        }
        if (links && !Array.isArray(links)) {
            return res.status(400).json({ success: false, error: "Links must be an array of strings" });
        }

        // Handle media upload
        let media_url = null;
        if (media) {
            try {
                const fileExt = media.name.split(".").pop();
                const fileName = `${Date.now()}_${user_id}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("posts-media")
                    .upload(fileName, Buffer.from(media.data, "base64"), {
                        contentType: media.type,
                    });

                if (uploadError) {
                    console.error("Media upload error:", uploadError);
                    return res.status(500).json({ success: false, error: "Failed to upload media" });
                }
                media_url = supabase.storage.from("posts-media").getPublicUrl(fileName).data.publicUrl;
            } catch (err) {
                console.error("Media processing error:", err);
                return res.status(500).json({ success: false, error: "Failed to process media" });
            }
        }

        // Insert post
        const { data, error } = await supabase
            .from("posts")
            .insert([
                {
                    user_id,
                    content,
                    category: category || "General",
                    media_url,
                    comments_enabled: comments_enabled !== undefined ? comments_enabled : true,
                    tagged_users: tagged_users || [],
                    tagged_communities: tagged_communities || [],
                    links: links || [],
                    votes: 0,
                },
            ])
            .select(`
        *,
        user:users(name, surname)
      `)
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