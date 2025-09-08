import express from "express";
import cors from "cors";
import { PORT, ALLOWED_ORIGINS } from "./config.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import postRoutes from "./routes/posts.js";
import communityRoutes from "./routes/communities.js";

const app = express();

// ✅ CORS setup to allow Vercel + localhost:5173
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS not allowed: " + origin));
            }
        },
        credentials: true,
    })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("✅ API is running"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/communities", communityRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
