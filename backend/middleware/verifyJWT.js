// middleware/verifyJWT.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    process.exit(1);
}

export function verifyJWT(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ success: false, error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // attach user data (id, email, etc.)
        next();
    } catch (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ success: false, error: "Invalid or expired token" });
    }
}
