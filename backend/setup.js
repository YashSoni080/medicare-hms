// Setup script — creates the initial admin account for the HMS app.
// Run: node setup.js  (from the backend folder, with MongoDB running)
// Usage: node setup.js --email admin@hospital.com --password your-password --name "Admin"
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const args = process.argv.slice(2);
const getArg = (key) => {
    const idx = args.indexOf(key);
    return idx >= 0 ? args[idx + 1] : null;
};

async function setup() {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/hospital_management");
        console.log("MongoDB connected");

        const email = getArg("--email") || "admin@hospital.com";
        const password = getArg("--password") || "admin123";
        const name = getArg("--name") || "Administrator";

        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`Admin already exists: ${email}`);
            await mongoose.disconnect();
            process.exit(0);
        }

        await User.create({ name, email, password, role: "admin" });
        console.log(`Admin created: ${email}`);

        console.log("\nSetup complete. You can now sign in with:");
        console.log(`  Email:    ${email}`);
        console.log(`  Password: ${password}`);
        console.log("\n⚠️  Change the password after first login (Profile → Change Password).");
    } catch (err) {
        console.error("Setup failed:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

setup();