import { Router } from "express";
import supabase from "../supabase";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Create post
router.post("/", authenticate, async (req: AuthRequest, res) => {
    const { id } = req.user;
    const { content, category, media_url } = req.body;

    const { data, error } = await supabase
        .from("posts")
        .insert([{ user_id: id, content, category, media_url }])
        .select("*")
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ post: data });
});

// Get user's posts
router.get("/", authenticate, async (req: AuthRequest, res) => {
    const { id } = req.user;

    const { data, error } = await supabase.from("posts").select("*").eq("user_id", id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ posts: data });
});

export default router;
