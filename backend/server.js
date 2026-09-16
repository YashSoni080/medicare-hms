import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctors.js";
import patientRoutes from "./routes/patients.js";
import appointmentRoutes from "./routes/appointments.js";
import recordRoutes from "./routes/records.js";
import encounterRoutes from "./routes/encounters.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import labOrderRoutes from "./routes/lab-orders.js";
import invoiceRoutes from "./routes/invoices.js";
import wardRoutes from "./routes/wards.js";
import inventoryRoutes from "./routes/inventory.js";
import insuranceRoutes from "./routes/insurance.js";
import auditLogRoutes from "./routes/audit-logs.js";
import dashboardRoutes from "./routes/dashboard.js";
import emergencyRoutes from "./routes/emergency.js";
import otRoutes from "./routes/ot.js";
import bloodBankRoutes from "./routes/blood-bank.js";
import nursingRoutes from "./routes/nursing.js";
import dietRoutes from "./routes/diet.js";
import radiologyRoutes from "./routes/radiology.js";
import telemedicineRoutes from "./routes/telemedicine.js";
import housekeepingRoutes from "./routes/housekeeping.js";
import ambulanceRoutes from "./routes/ambulance.js";
import staffRoutes from "./routes/staff.js";
import reportRoutes from "./routes/reports.js";
import serviceChargeRoutes from "./routes/service-charges.js";
import userRoutes from "./routes/users.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Load env vars
dotenv.config();

const app = express();

// --------------- Middleware ---------------
// Allow multiple origins: CLIENT_URL can be a comma-separated list.
// Defaults cover local dev and the deployed Vercel frontend, so the API
// works even if CLIENT_URL is not set in the environment.
const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .concat(["http://localhost:5173", "https://medicare-hms-2iw7.vercel.app", "https://medicare-hms-one.vercel.app/"]);

app.use(
    cors({
        origin(origin, callback) {
            // Allow requests with no origin (curl, Postman, same-origin)
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true,
    })
);
app.use(express.json());

// --------------- Routes ---------------
app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "MediCare API is running" });
});

// Health check — reports DB connectivity so deployment issues are obvious
app.get("/api/health", (_req, res) => {
    const dbState = mongoose.connection.readyState; // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    res.status(dbState === 1 ? 200 : 503).json({
        status: dbState === 1 ? "ok" : "degraded",
        db: states[dbState] || "unknown",
        mongoUriSet: Boolean(process.env.MONGO_URI),
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/encounters", encounterRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/lab-orders", labOrderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/wards", wardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/ot", otRoutes);
app.use("/api/blood-bank", bloodBankRoutes);
app.use("/api/nursing", nursingRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/radiology", radiologyRoutes);
app.use("/api/telemedicine", telemedicineRoutes);
app.use("/api/housekeeping", housekeepingRoutes);
app.use("/api/ambulance", ambulanceRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/service-charges", serviceChargeRoutes);
app.use("/api/users", userRoutes);

// --------------- Production: serve built frontend ---------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "..", "frontend", "dist");

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // SPA fallback: any non-API GET request serves the React app
    app.use((req, res, next) => {
        if (req.method === "GET" && !req.path.startsWith("/api/")) {
            return res.sendFile(path.join(distPath, "index.html"));
        }
        next();
    });
    console.log("Serving frontend from", distPath);
} else {
    console.log("frontend/dist not found - API only mode (run `npm run build` in frontend to enable static serving)");
}

// --------------- Error handler (must be last) ---------------
app.use(errorHandler);

// --------------- Start server ---------------
const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start listening. On failure, log a clear message
// and keep the process alive so Vercel can report the error instead of
// buffering queries for 10s.
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`MediCare API listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err.message);
        // Still start the server so /api/health can report the problem
        app.listen(PORT, () => {
            console.log(`MediCare API listening on port ${PORT} (DB NOT CONNECTED)`);
        });
    });
