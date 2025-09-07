import { Router } from "express";
import supabase from "../supabase.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
    const { id } = req.user;

    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", id).single();
    if (error) return res.status(400).json({ error: error.message });

    res.json({ profile: data });
});

export default router;
