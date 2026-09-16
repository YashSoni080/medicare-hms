import mongoose from "mongoose";

const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error(
            "MONGO_URI is not set. Add your MongoDB Atlas connection string " +
            "to the MONGO_URI environment variable."
        );
    }

    // Sanitized copy for logs (hide credentials)
    const logUri = uri.replace(/\/\/[^@/]+@/, "//***:***@");

    try {
        // Fail fast: don't buffer queries for 10s when the DB is unreachable
        mongoose.set("bufferCommands", false);
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        console.error(`MONGO_URI (sanitized): ${logUri}`);
        throw error;
    }
};

export default connectDB;
