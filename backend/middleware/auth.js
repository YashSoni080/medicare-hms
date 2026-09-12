import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect routes — verifies JWT and attaches user to req.user
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized — no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Not authorized — user not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account has been deactivated" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Not authorized — token invalid" });
    }
};

/**
 * Restrict to specific roles — must be used AFTER protect
 * Usage: authorize("admin", "doctor")
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role '${req.user.role}' is not authorized to access this resource`,
            });
        }
        next();
    };
};
