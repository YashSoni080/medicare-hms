import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
    {
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
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
        },
        type: {
            type: String,
            enum: ["diagnosis", "prescription", "lab_report", "imaging", "note"],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: 3000,
        },
        diagnosis: {
            condition: String,
            icdCode: String,
        },
        prescription: {
            medications: [
                {
                    name: String,
                    dosage: String,
                    frequency: String,
                    duration: String,
                    instructions: String,
                },
            ],
        },
        labResults: {
            testName: String,
            results: [{ parameter: String, value: String, unit: String, normalRange: String }],
        },
        attachments: {
            type: [String], // file paths / URLs
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);
