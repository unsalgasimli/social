// backend/src/routes/communities.js
import { Router } from "express";
import supabase from "../supabase.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Create community
router.post("/", authenticate, async (req, res) => {
    try {
        const { id } = req.user;
        const { name, description, is_private } = req.body;

        const { data, error } = await supabase
            .from("communities")
            .insert([{ name, description, is_private, created_by: id }])
            .select("*")
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ community: data });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Join community
router.post("/:community_id/join", authenticate, async (req, res) => {
    try {
        const { id } = req.user;
        const { community_id } = req.params;

        const { data, error } = await supabase
            .from("community_members")
            .insert([{ community_id, user_id: id }])
            .select("*")
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ membership: data });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
