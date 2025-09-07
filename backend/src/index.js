import express from "express";
import cors from "cors";
import { PORT, ALLOWED_ORIGINS } from "./config.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";

const app = express();

// CORS setup
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) callback(null, true);
        else callback(new Error("CORS not allowed"));
    },
    credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => res.send("✅ API is running"));

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
