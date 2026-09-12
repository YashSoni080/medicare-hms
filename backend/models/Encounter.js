import mongoose from "mongoose";

const encounterSchema = new mongoose.Schema(
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
        visitType: {
            type: String,
            enum: ["OPD", "IPD", "EMERGENCY"],
            default: "OPD",
        },
        vitals: {
            bpSystolic: Number,
            bpDiastolic: Number,
            pulse: Number,
            temperature: Number,
            spo2: Number,
            weight: Number,
            height: Number,
            bmi: Number,
        },
        chiefComplaints: {
            type: String,
            maxlength: 2000,
        },
        diagnosisCodes: [
            {
                code: String, // ICD-10
                description: String,
            },
        ],
        clinicalNotes: {
            type: String,
            maxlength: 5000,
        },
        status: {
            type: String,
            enum: ["waiting", "in-consultation", "completed", "skipped", "sent-for-lab"],
            default: "waiting",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Encounter", encounterSchema);