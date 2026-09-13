import mongoose from "mongoose";

const teleconsultationSchema = new mongoose.Schema(
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
        scheduledAt: {
            type: Date,
            required: true,
        },
        durationMinutes: {
            type: Number,
            default: 30,
        },
        mode: {
            type: String,
            enum: ["video", "audio", "chat"],
            default: "video",
        },
        status: {
            type: String,
            enum: ["scheduled", "in-progress", "completed", "cancelled", "no-show"],
            default: "scheduled",
        },
        consultationNotes: {
            type: String,
            maxlength: 3000,
        },
        meetingUrl: String,
    },
    { timestamps: true }
);

export default mongoose.model("Teleconsultation", teleconsultationSchema);