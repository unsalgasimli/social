import express from "express";
import cors from "cors";
import { PORT, ALLOWED_ORIGINS } from "./config.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import postRoutes from "./routes/posts.js";
import communityRoutes from "./routes/communities.js";

const app = express();

// ✅ Improved CORS setup
app.use(
    cors({
        origin: (origin, callback) => {
            console.log("CORS origin:", origin); // for debugging
            if (!origin) return callback(null, true); // allow server-to-server or curl requests
            if (ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("CORS not allowed: " + origin));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow preflight
        allowedHeaders: ["Content-Type", "Authorization"],     // required for JWT auth
    })
);

// Handle preflight requests explicitly
app.options("*", cors());

app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("✅ API is running"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/communities", communityRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
