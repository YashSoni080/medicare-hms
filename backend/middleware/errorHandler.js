/**
 * Centralised error handler — placed last in the middleware chain.
 * Express recognises a 4-arg function as an error handler.
 */
export const errorHandler = (err, _req, res, _next) => {
    console.error(err.stack);

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: "Validation error", errors: messages });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(", ");
        return res.status(409).json({ message: `Duplicate value for: ${field}` });
    }

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token has expired" });
    }

    // Fallback
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || "Internal server error",
    });
};
