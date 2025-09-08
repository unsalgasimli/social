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

        // Basic validation
        if (!name || !surname || !email || !password) {
            return res.status(400).json({ error: "Ad, soyad, email və şifrə tələb olunur" });
        }

        // Check if email exists
        const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .single();

        if (checkError && checkError.code !== "PGRST116") {
            console.error("Supabase error checking email:", checkError.message);
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
            .insert([
                { name, surname, email, phone, age, gender, password: hashedPassword },
            ])
            .select("id, email, name, surname")
            .single();

        if (insertError) {
            console.error("Insert error:", insertError.message);
            return res.status(500).json({ error: "Qeydiyyat zamanı xəta baş verdi" });
        }

        res.status(201).json({ message: "Qeydiyyat uğurlu oldu ✅", user: newUser });
    } catch (err) {
        console.error("Register route error:", err);
        res.status(500).json({ error: "Serverdə xəta baş verdi" });
    }
});

// ============================
// LOGIN
// ============================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate
        if (!email || !password) {
            return res.status(400).json({ error: "Email və şifrə tələb olunur" });
        }

        // Find user by email
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id, name, surname, email, password")
            .eq("email", email)
            .single();

        if (userError || !user) {
            return res.status(401).json({ error: "Email və ya şifrə səhvdir" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Email və ya şifrə səhvdir" });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            message: "Daxil oldunuz ✅",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
            },
        });
    } catch (err) {
        console.error("Login route error:", err);
        res.status(500).json({ error: "Serverdə xəta baş verdi" });
    }
});

export default router;
