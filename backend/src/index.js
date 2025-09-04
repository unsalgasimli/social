import express from "express";
import cors from "cors";
import { PORT, FRONTEND_URL } from "./config";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import postRoutes from "./routes/posts";
import communityRoutes from "./routes/communities";

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.send("✅ API is running"));

app.use("/routes/auth", authRoutes);
app.use("/routes/profile", profileRoutes);
app.use("/routes/posts", postRoutes);
app.use("/routes/communities", communityRoutes);

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
