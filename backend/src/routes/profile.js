import { Router } from "express";
import supabase from "../supabase.js";
import { authenticate } from "../middleware/auth.js";  // no type import

const router = Router();

// Get own profile
router.get("/", authenticate, async (req, res) => {
    const { id } = req.user;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", id)
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
});

// Update profile
router.put("/", authenticate, async (req, res) => {
    const { id } = req.user;
    const updates = req.body;

    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", id)
        .select("*")
        .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
});

export default router;
