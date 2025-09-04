// index.js
// Main entry point for the Express.js backend application.
// Integrates Supabase, JWT, and secure routes with profile and auth endpoints.
// Best practices: Security headers, rate limiting, CORS, logging, env validation.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient } from "@supabase/supabase-js";
import profileRouter from "./routes/profile.js"; // Profile routes
import authRouter from "./routes/auth.js"; // Auth routes

dotenv.config();

// Validate environment variables
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_KEY", "JWT_SECRET", "ALLOWED_ORIGINS"];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(`Missing environment variables: ${missingEnvVars.join(", ")}`);
    process.exit(1);
}

const app = express();

// Security: Disable X-Powered-By header
app.disable("x-powered-by");

// Security: Apply Helmet for secure HTTP headers
app.use(helmet());

// Middleware: Parse JSON bodies
app.use(express.json());

// Middleware: CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS not allowed for origin: ${origin}`));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

// Middleware: Rate limiting
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: { success: false, error: "Too many requests, please try again later." },
        standardHeaders: true,
        legacyHeaders: false,
    })
);

// Middleware: Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (Object.keys(req.body).length) console.log("Body:", req.body);
    next();
});

// Initialize Supabase client
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Mount routes
app.use("/api/profile", profileRouter);
app.use("/api/auth", authRouter);

/**
 * GET /api/health
 * Health check endpoint to verify server status.
 * @returns {Object} JSON with status
 */
app.get("/api/health", (req, res) => {
    res.json({ success: true, status: "OK" });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Not Found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`Error [${new Date().toISOString()}]:`, err.stack);
    res.status(500).json({ success: false, error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Backend listening on port ${PORT}`);
});