import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "https://social-dusky-one.vercel.app/";
app.use(cors());
//app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, surname, email, phone, age, gender, password } = req.body;

        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (existingUser) return res.status(400).json({ error: "Email artıq istifadə olunur" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabase
            .from("users")
            .insert([{ name, surname, email, phone, age, gender, password: hashedPassword }])
            .select("id, email")
            .single();

        if (error) throw error;

        const token = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ message: "Qeydiyyat uğurlu oldu ✅", user: { id: data.id, email: data.email }, token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Qeydiyyat uğursuz oldu" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !user) return res.status(400).json({ error: "İstifadəçi tapılmadı" });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json({ error: "Şifrə yanlışdır" });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "Daxil oldunuz ✅", user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Daxil olma uğursuz oldu" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend listening on port ${PORT}`));
