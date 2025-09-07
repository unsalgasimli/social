import { Router } from "express";
import supabase from "../supabase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

const router = Router();

// Register
router.post("/register", async (req, res) => {
    const { name, surname, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from("users")
        .insert([{ name, surname, email, password: hashedPassword }])
        .select("id, name, surname, email")
        .single();

    if (error) return res.status(400).json({ error: error.message });

    const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: data });
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();
    if (error || !user) return res.status(400).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, surname: user.surname, email: user.email } });
});

export default router;
