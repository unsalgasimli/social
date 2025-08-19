    import express from "express";
    import cors from "cors";
    import dotenv from "dotenv";
    import bcrypt from "bcrypt";
    import jwt from "jsonwebtoken";
    import { createClient } from "@supabase/supabase-js";

    // ✅ Load environment variables before anything else
    dotenv.config();

    const app = express();
    app.use(cors({ origin: "http://localhost:5173" })); // adjust if frontend uses another port
    app.use(express.json());

    // ✅ Initialize Supabase client
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY
    );

    // ======================= REGISTER =======================
    app.post("/api/auth/register", async (req, res) => {
        try {
            const { name, surname, email, phone, age, gender, password } = req.body;

            // check if email already exists
            const { data: existingUser } = await supabase
                .from("users")
                .select("id")
                .eq("email", email)
                .maybeSingle();

            if (existingUser) {
                return res.status(400).json({ error: "Email artıq istifadə olunur" });
            }

            // hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // insert new user
            const { data, error } = await supabase
                .from("users")
                .insert([
                    { name, surname, email, phone, age, gender, password: hashedPassword },
                ])
                .select("id, email") // return new user’s id & email
                .single();

            if (error) throw error;

            // generate JWT
            const token = jwt.sign(
                { id: data.id, email: data.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.status(201).json({
                message: "Qeydiyyat uğurlu oldu ✅",
                user: { id: data.id, email: data.email },
                token,
            });
        } catch (error) {
            console.error("❌ Error during registration:", error.message);
            res.status(500).json({ error: "Qeydiyyat uğursuz oldu" });
        }
    });

    // ======================= LOGIN =======================
    app.post("/api/auth/login", async (req, res) => {
        try {
            const { email, password } = req.body;

            // get user by email
            const { data: user, error } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

            if (error || !user) {
                return res.status(400).json({ error: "İstifadəçi tapılmadı" });
            }

            // compare password
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(400).json({ error: "Şifrə yanlışdır" });
            }

            // sign JWT
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                message: "Daxil oldunuz ✅",
                user: { id: user.id, email: user.email, name: user.name },
                token,
            });
        } catch (error) {
            console.error("❌ Error during login:", error.message);
            res.status(500).json({ error: "Daxil olma uğursuz oldu" });
        }
    });

    // ======================= START SERVER =======================
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
        console.log(`✅ Backend http://localhost:${PORT} ünvanında işə düşdü`)
    );
