import express from "express";
import cors from "cors";
import { PORT, ALLOWED_ORIGINS } from "./config.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import postRoutes from "./routes/posts.js";
import communityRoutes from "./routes/communities.js";

const app = express();

// ✅ CORS setup
app.use(
    cors({
        origin: (origin, callback) => {
            console.log("CORS origin:", origin);
            if (!origin) return callback(null, true); // allow server-to-server requests
            if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
            return callback(new Error("CORS not allowed: " + origin));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ✅ Handle preflight OPTIONS requests
app.options("*", cors());

// Body parser
app.use(express.json());


app.get("/", (req, res) => res.send("✅ API is running"));

// Routes (all relative paths!)
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/communities", communityRoutes);

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
