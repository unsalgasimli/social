// backend/src/routes/posts.js
import { Router } from "express";
import supabase from "../supabase.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Create post
router.post("/", authenticate, async (req, res) => {
    try {
        const { id } = req.user;
        const { content, category, media_url } = req.body;

        const { data, error } = await supabase
            .from("posts")
            .insert([{ user_id: id, content, category, media_url }])
            .select("*")
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ post: data });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get user's posts
router.get("/", authenticate, async (req, res) => {
    try {
        const { id } = req.user;

        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .eq("user_id", id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ posts: data });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
