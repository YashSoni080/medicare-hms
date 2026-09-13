import mongoose from "mongoose";

const emergencyCaseSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        arrivalMode: {
            type: String,
            enum: ["walk-in", "ambulance", "referred"],
            default: "walk-in",
        },
        triageLevel: {
            type: String,
            enum: ["resuscitation", "emergency", "urgent", "semi-urgent", "non-urgent"],
            default: "urgent",
        },
        chiefComplaint: {
            type: String,
            required: [true, "Chief complaint is required"],
            maxlength: 2000,
        },
        vitals: {
            bpSystolic: Number,
            bpDiastolic: Number,
            pulse: Number,
            temperature: Number,
            spo2: Number,
            weight: Number,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },
        condition: {
            type: String,
            maxlength: 2000,
        },
        status: {
            type: String,
            enum: ["triage", "in-treatment", "admitted", "discharged", "referred-out"],
            default: "triage",
        },
        treatmentNotes: {
            type: String,
            maxlength: 5000,
        },
        dischargedAt: Date,
    },
    { timestamps: true }
);

export default mongoose.model("EmergencyCase", emergencyCaseSchema);