import mongoose from "mongoose";

const ambulanceSchema = new mongoose.Schema(
    {
        vehicleNumber: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ["basic", "advanced", "icu"],
            default: "basic",
        },
        driverName: String,
        driverPhone: String,
        status: {
            type: String,
            enum: ["available", "on-trip", "maintenance"],
            default: "available",
        },
        currentLocation: String,
    },
    { timestamps: true }
);

const ambulanceTripSchema = new mongoose.Schema(
    {
        ambulance: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ambulance",
            required: true,
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
        },
        pickupLocation: String,
        dropLocation: String,
        startTime: Date,
        endTime: Date,
        status: {
            type: String,
            enum: ["requested", "dispatched", "on-scene", "transporting", "completed", "cancelled"],
            default: "requested",
        },
        notes: String,
    },
    { timestamps: true }
);

export default mongoose.model("Ambulance", ambulanceSchema);
export const AmbulanceTrip = mongoose.model("AmbulanceTrip", ambulanceTripSchema);