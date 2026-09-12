import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true }, // "General Ward A"
        category: {
            type: String,
            enum: ["general", "semi-private", "private", "icu", "nicu", "deluxe"],
            required: true,
        },
        floor: String,
        tariffPerDay: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const bedSchema = new mongoose.Schema(
    {
        ward: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ward",
            required: true,
        },
        bedNumber: { type: String, required: true }, // "A-101"
        status: {
            type: String,
            enum: ["available", "occupied", "cleaning", "reserved", "maintenance"],
            default: "available",
        },
        currentPatient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
        },
    },
    { timestamps: true }
);

const admissionSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        bed: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bed",
            required: true,
        },
        admittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        admissionDate: { type: Date, default: Date.now },
        dischargeDate: Date,
        status: {
            type: String,
            enum: ["admitted", "discharged", "transferred"],
            default: "admitted",
        },
        depositAmount: { type: Number, default: 0 },
        reason: String,
        dischargeSummary: String,
    },
    { timestamps: true }
);

export { wardSchema, bedSchema, admissionSchema };
export default mongoose.model("Ward", wardSchema);
export const Bed = mongoose.model("Bed", bedSchema);
export const Admission = mongoose.model("Admission", admissionSchema);