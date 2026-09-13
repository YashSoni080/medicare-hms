import mongoose from "mongoose";

const nursingTaskSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        admission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admission",
        },
        taskType: {
            type: String,
            enum: ["medication", "vitals", "dressing", "injection", "iv-fluid", "observation", "other"],
            required: true,
        },
        description: {
            type: String,
            maxlength: 1000,
        },
        scheduledTime: Date,
        completedTime: Date,
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed", "skipped"],
            default: "pending",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        notes: {
            type: String,
            maxlength: 1000,
        },
    },
    { timestamps: true }
);

const vitalRecordSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        bpSystolic: Number,
        bpDiastolic: Number,
        pulse: Number,
        temperature: Number,
        spo2: Number,
        respiratoryRate: Number,
        weight: Number,
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        notes: String,
    },
    { timestamps: true }
);

export default mongoose.model("NursingTask", nursingTaskSchema);
export const VitalRecord = mongoose.model("VitalRecord", vitalRecordSchema);