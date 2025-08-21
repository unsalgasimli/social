import express from "express";
import { supabase } from "../lib/supabaseClient.js";
import { verifyJWT } from "../middleware/auth.js";

const router = express.Router();

// Get profile
router.get("/", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user.id;

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user_id)
            .single();

        if (error) throw error;

        res.json({ profile: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// Update profile
router.put("/", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user.id;
        const updatedData = req.body;

        const { data, error } = await supabase
            .from("profiles")
            .update(updatedData)
            .eq("user_id", user_id)
            .select()
            .single();

        if (error) throw error;

        res.json({ profile: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// Fetch posts
router.get("/posts", verifyJWT, async (req, res) => {
    try {
        const { category } = req.query; // optional
        let query = supabase.from("posts").select("*").eq("user_id", req.user.id);

        if (category) query = query.eq("category", category);

        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) throw error;

        res.json({ posts: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// Fetch communities
router.get("/communities", verifyJWT, async (req, res) => {
    try {
        const user_id = req.user.id;

        const { data, error } = await supabase
            .from("profiles")
            .select("communities")
            .eq("user_id", user_id)
            .single();

        if (error) throw error;

        res.json({ communities: data?.communities || [] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch communities" });
    }
});

export default router;
