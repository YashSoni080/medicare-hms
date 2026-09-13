import mongoose from "mongoose";

const radiologyOrderSchema = new mongoose.Schema(
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
        modality: {
            type: String,
            enum: ["x-ray", "ct", "mri", "ultrasound", "ecg", "echo", "endoscopy", "other"],
            required: true,
        },
        bodyPart: String,
        clinicalHistory: {
            type: String,
            maxlength: 2000,
        },
        findings: {
            type: String,
            maxlength: 5000,
        },
        impression: {
            type: String,
            maxlength: 2000,
        },
        status: {
            type: String,
            enum: ["ordered", "scheduled", "in-progress", "completed", "cancelled"],
            default: "ordered",
        },
        reportReady: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("RadiologyOrder", radiologyOrderSchema);