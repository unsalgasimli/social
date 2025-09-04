import { Router } from "express";
import supabase from "../supabase";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Create community
router.post("/", authenticate, async (req: AuthRequest, res) => {
    const { id } = req.user;
    const { name, description, is_private } = req.body;

    const { data, error } = await supabase
        .from("communities")
        .insert([{ name, description, is_private, created_by: id }])
        .select("*")
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ community: data });
});

// Join community
router.post("/:community_id/join", authenticate, async (req: AuthRequest, res) => {
    const { id } = req.user;
    const { community_id } = req.params;

    const { data, error } = await supabase
        .from("community_members")
        .insert([{ community_id, user_id: id }])
        .select("*")
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ membership: data });
});

export default router;
