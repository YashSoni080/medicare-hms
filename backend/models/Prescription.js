import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
    {
        encounter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Encounter",
            required: true,
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        items: [
            {
                name: { type: String, required: true },
                dosage: String, // "500mg"
                frequency: String, // "1-0-1"
                durationDays: Number,
                route: String, // "oral", "IV", "topical"
                instructions: String, // "After food"
            },
        ],
        status: {
            type: String,
            enum: ["pending", "dispensed", "partial", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);