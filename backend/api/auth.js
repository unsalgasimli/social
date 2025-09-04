// routes/auth.js
// Defines authentication endpoints for user registration and login.
// Integrates with Supabase for database operations, bcrypt for password hashing, and JWT for tokens.
// Best practices: Input validation, consistent responses, error logging, secure environment variable usage.

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../lib/supabaseClient.js";

const router = express.Router();

// Ensure JWT_SECRET is available
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    process.exit(1);
}

/**
 * POST /api/auth/register
 * Registers a new user, creates a profile, and generates a JWT token.
 * @param {Object} req.body - User data (name, surname, email, phone, age, gender, password)
 * @returns {Object} JSON with user, profile, and token
 */
router.post("/register", async (req, res) => {
    try {
        const { name, surname, email, phone, age, gender, password } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: "Name, email, and password are required" });
        }
        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ success: false, error: "Invalid input types" });
        }
        if (surname && typeof surname !== "string") {
            return res.status(400).json({ success: false, error: "Surname must be a string" });
        }
        if (phone && typeof phone !== "string") {
            return res.status(400).json({ success: false, error: "Phone must be a string" });
        }
        if (age && (!Number.isInteger(age) || age < 0)) {
            return res.status(400).json({ success: false, error: "Age must be a positive integer" });
        }
        if (gender && typeof gender !== "string") {
            return res.status(400).json({ success: false, error: "Gender must be a string" });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
        }

        // Check for existing user
        const { data: existingUser, error: existingError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (existingError) {
            console.error("Check existing user error:", existingError);
            return res.status(500).json({ success: false, error: "Failed to check email" });
        }
        if (existingUser) {
            return res.status(400).json({ success: false, error: "Email artıq istifadə olunub" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const { data: user, error: userError } = await supabase
            .from("users")
            .insert([{ name, surname, email, phone, age, gender, password: hashedPassword }])
            .select("id, email, name, surname")
            .single();

        if (userError) {
            console.error("User insert error:", userError);
            return res.status(500).json({ success: false, error: "Qeydiyyat uğursuz oldu" });
        }

        // Create profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .insert([
                {
                    user_id: user.id,
                    country: "Azərbaycan",
                    interests: [],
                    social_links: {},
                    optional_links: {},
                    music_links: [],
                    film_links: [],
                    serial_links: [],
                },
            ])
            .select()
            .single();

        if (profileError) {
            console.error("Profile creation error:", profileError);
            return res.status(500).json({ success: false, error: "Failed to create profile" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(201).json({
            success: true,
            message: "Qeydiyyat uğurla tamamlandı",
            user: { id: user.id, email: user.email, name: user.name, surname: user.surname },
            profile,
            token,
        });
    } catch (err) {
        console.error("Unexpected error in POST /auth/register:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * POST /api/auth/login
 * Authenticates a user and generates a JWT token.
 * @param {Object} req.body - Credentials (email, password)
 * @returns {Object} JSON with user, profile, and token
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required" });
        }
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ success: false, error: "Invalid input types" });
        }

        // Fetch user
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, email, name, surname, password")
            .eq("email", email)
            .single();

        if (userError || !user) {
            return res.status(400).json({ success: false, error: "Email tapılmadı" });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ success: false, error: "Şifrə yanlışdır" });
        }

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (profileError) {
            console.error("Profile fetch error:", profileError);
            return res.status(500).json({ success: false, error: "Failed to fetch profile" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            success: true,
            message: "Uğurlu login",
            user: { id: user.id, email: user.email, name: user.name, surname: user.surname },
            profile,
            token,
        });
    } catch (err) {
        console.error("Unexpected error in POST /auth/login:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;