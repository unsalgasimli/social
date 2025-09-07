import express from "express";
import cors from "cors";
import { PORT, FRONTEND_URL } from "./config.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import postRoutes from "./routes/posts.js";
import communityRoutes from "./routes/communities.js";

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("✅ API is running"));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/communities", communityRoutes);

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
