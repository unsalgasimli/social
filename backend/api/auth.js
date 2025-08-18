import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../../frontend/src/lib/supabaseClient";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // production-da mütləq .env istifadə et

// REGISTER
router.post("/register", async (req, res) => {
    const { name, surname, email, phone, age, gender, password } = req.body;

    try {
        // Email yoxla
        const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (existingUser) return res.status(400).json({ error: "Email artıq istifadə olunub." });

        // Parolu hash-lə
        const hashedPassword = await bcrypt.hash(password, 10);

        // Users cədvəlinə əlavə et
        const { data: user, error: userError } = await supabase
            .from("users")
            .insert([{ name, surname, email, phone, age, gender, password: hashedPassword }])
            .select()
            .single();

        if (userError) throw userError;

        // Profile avtomatik yarad
        await supabase.from("profiles").insert([{ user_id: user.id, country: "Azərbaycan", interests: [], social_links: {} }]);

        // JWT token yarat
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "Qeydiyyat uğurla tamamlandı", user, token });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message || "Qeydiyyat uğursuz oldu" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: user } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (!user) return res.status(400).json({ error: "Email tapılmadı" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Şifrə yanlışdır" });

        // JWT token yarat
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "Uğurlu login", user, token });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message || "Login uğursuz oldu" });
    }
});

export default router;
