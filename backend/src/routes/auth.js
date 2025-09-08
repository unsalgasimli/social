import { Router } from "express";
import supabase from "../supabase.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

const router = Router();

// ============================
// REGISTER
// ============================
router.post("/register", async (req, res) => {
    try {
        const { name, surname, email, phone, age, gender, password } = req.body;

        if (!name || !surname || !email || !password)
            return res.status(400).json({ error: "Name, surname, email, and password are required" });

        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            console.error("Supabase check error:", checkError.message);
            return res.status(500).json({ error: "Database error" });
        }

        if (existingUser) return res.status(409).json({ error: "Email already registered" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([{ name, surname, email, phone, age, gender, password: hashedPassword }])
            .select("id, name, surname, email")
            .single();

        if (insertError) {
            console.error("Supabase insert error:", insertError.message);
            return res.status(500).json({ error: "Registration failed" });
        }

        // Generate JWT
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ message: "Registration successful ✅", token, user: newUser });
    } catch (err) {
        console.error("Register route error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ============================
// LOGIN
// ============================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password required" });

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, name, surname, email, password")
            .eq("email", email)
            .single();

        if (userError || !user) return res.status(401).json({ error: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful ✅",
            token,
            user: { id: user.id, name: user.name, surname: user.surname, email: user.email },
        });
    } catch (err) {
        console.error("Login route error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
