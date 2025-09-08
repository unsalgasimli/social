import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

// Named export so import { authenticate } works
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Authorization required" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // attach user info to request
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token invalid" });
    }
};
