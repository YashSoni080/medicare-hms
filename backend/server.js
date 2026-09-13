import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

// Connect to database
connectDB();

const app = express();

// --------------- Middleware ---------------
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// --------------- Routes ---------------
app.get("/", (_req, res) => {
    res.json({ status: "ok", message: "MediCare API is running" });
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

// --------------- Error handler (must be last) ---------------
app.use(errorHandler);

// --------------- Start server ---------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`MediCare API listening on port ${PORT}`);
});
