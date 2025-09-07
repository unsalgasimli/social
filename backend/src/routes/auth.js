// backend/src/routes/auth.js
import { Router } from "express";
import supabase from "../supabase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

const router = Router();

// Register new user
router.post("/register", async (req, res) => {
    try {
        const { name, surname, email, password, phone, age, gender } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into Supabase
        const { data, error } = await supabase
            .from("users")
            .insert([{ name, surname, email, password: hashedPassword, phone, age, gender }])
            .select("id, name, surname, email")
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Create JWT token
        const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, user: data });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login existing user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Fetch user by email
        const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single();
        if (error || !user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.json({ token, user: { id: user.id, name: user.name, surname: user.surname, email: user.email } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
