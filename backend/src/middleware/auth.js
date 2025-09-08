// src/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import supabase from "../supabase.js";

const router = express.Router();

// ============================
// REGISTER
// ============================
router.post("/register", async (req, res) => {
    try {
        const { name, surname, email, phone, age, gender, password } = req.body;

        // Validation
        if (!name || !surname || !email || !password) {
            return res.status(400).json({ error: "Ad, soyad, email və şifrə tələb olunur" });
        }

        // Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (fetchError) {
            console.error("Supabase fetch error:", fetchError);
            return res.status(500).json({ error: "Məlumat bazası xətası" });
        }

        if (existingUser) {
            return res.status(409).json({ error: "Bu email artıq qeydiyyatdan keçib" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([{ name, surname, email, phone, age, gender, password: hashedPassword }])
            .select("id, name, surname, email")
            .single();

        if (insertError) {
            console.error("Supabase insert error:", insertError);
            return res.status(500).json({ error: "Qeydiyyat zamanı xəta baş verdi" });
        }

        return res.status(201).json({
            message: "Qeydiyyat uğurlu oldu ✅",
            user: newUser,
        });

    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "Serverdə xəta baş verdi" });
    }
});

// ============================
// LOGIN
// ============================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: "Email və şifrə tələb olunur" });
        }

        // Fetch user
        const { data: user, error: fetchError } = await supabase
            .from("users")
            .select("id, name, surname, email, password")
            .eq("email", email)
            .maybeSingle();

        if (fetchError || !user) {
            return res.status(401).json({ error: "Email və ya şifrə səhvdir" });
        }

        // Check password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: "Email və ya şifrə səhvdir" });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        return res.json({
            message: "Daxil oldunuz ✅",
            token,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
            },
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Serverdə xəta baş verdi" });
    }
});

export default router;
