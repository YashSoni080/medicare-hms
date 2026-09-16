import mongoose from "mongoose";

// Cache on `global` so warm serverless invocations reuse the connection
// instead of opening a new one per request.
const cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error(
            "MONGO_URI is not set. Add your MongoDB Atlas connection string " +
            "to the MONGO_URI environment variable."
        );
    }

    // Healthy connection → reuse it
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // Connection attempt already in progress → wait for it
    if (cached.promise) {
        return cached.promise;
    }

    mongoose.set("bufferCommands", false);

    const logUri = uri.replace(/\/\/[^@/]+@/, "//***:***@");

    cached.promise = mongoose
        .connect(uri, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        })
        .then((conn) => {
            cached.conn = conn;
            console.log(`MongoDB connected: ${conn.connection.host}`);
            return conn;
        })
        .catch((error) => {
            console.error(`MongoDB connection error: ${error.message}`);
            console.error(`MONGO_URI (sanitized): ${logUri}`);
            // Reset so the NEXT request can retry instead of failing forever
            cached.promise = null;
            cached.conn = null;
            throw error;
        });

    return cached.promise;
};

export default connectDB;