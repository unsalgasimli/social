// index.js
// Main entry point for the Express.js backend application.
// Integrates Supabase for database operations, JWT for authentication, and secure routes.
// Best practices applied: Security headers (Helmet), rate limiting, CORS configuration,
// custom error handling, logging, and environment variable usage for secrets.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet"; // Security headers middleware
import rateLimit from "express-rate-limit"; // Rate limiting middleware
import { createClient } from "@supabase/supabase-js";
import profileRouter from "./profile.js"; // Import profile routes (adjust path if in routes/ folder)

dotenv.config(); // Load environment variables from .env file

const app = express();

// Disable X-Powered-By header to reduce fingerprinting
app.disable("x-powered-by");

// Apply Helmet for security HTTP headers
app.use(helmet());

// Parse JSON request bodies
app.use(express.json());

// CORS configuration with origin validation
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173", "https://social-dusky-one.vercel.app"];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS not allowed for this origin: ${origin}`));
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

// Rate limiting to prevent brute-force attacks (100 requests per 15 minutes per IP)
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per window
        message: { success: false, error: "Too many requests, please try again later." },
        standardHeaders: true, // Return rate limit info in headers
        legacyHeaders: false,
    })
);

// Logging middleware for request debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log("Body:", req.body);
    next();
});

// Initialize Supabase client with service key for server-side operations
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Mount profile routes
app.use("/api/profile", profileRouter);

/**
 * POST /api/auth/register
 * Registers a new user with hashed password and auto-generates JWT token.
 * @param {Object} req.body - User registration data
 * @returns {Object} JSON response with user and token
 */
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, surname, email, phone, age, gender, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        // Check for existing user by email
        const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (existingUser) {
            return res.status(400).json({ success: false, error: "Email already exists" });
        }

        // Hash password with bcrypt (salt rounds: 10)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into Supabase
        const { data, error } = await supabase
            .from("users")
            .insert([{ name, surname, email, phone, age, gender, password: hashedPassword }])
            .select("id, email")
            .single();

        if (error) throw error;

        // Generate JWT token
        const token = jwt.sign(
            { id: data.id, email: data.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({ success: true, message: "User created successfully", user: data, token });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ success: false, error: "Registration failed" });
    }
});

/**
 * POST /api/auth/login
 * Authenticates a user and generates a JWT token.
 * @param {Object} req.body - Login credentials (email, password)
 * @returns {Object} JSON response with user and token
 */
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Missing email or password" });
        }

        // Fetch user by email
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !user) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, error: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ success: true, message: "Logged in successfully", user, token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, error: "Login failed" });
    }
});

/**
 * GET /api/health
 * Health check endpoint to verify server status.
 * @returns {Object} JSON response with status
 */
app.get("/api/health", (req, res) => res.json({ success: true, status: "OK" }));

// Custom 404 handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, error: "Not Found" });
});

// Custom error handler
app.use((err, req, res, next) => {
    console.error("Global error:", err.stack);
    res.status(500).json({ success: false, error: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Backend listening on port ${PORT}`);
});