import mongoose from "mongoose";

const operationTheatreSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        surgeon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        procedure: {
            type: String,
            required: [true, "Procedure name is required"],
            maxlength: 500,
        },
        otRoom: {
            type: String,
            default: "OT-1",
        },
        scheduledDate: {
            type: Date,
            required: [true, "Scheduled date is required"],
        },
        startTime: String,
        endTime: String,
        anesthesiaType: {
            type: String,
            enum: ["general", "spinal", "epidural", "local", "regional", "none"],
            default: "general",
        },
        status: {
            type: String,
            enum: ["scheduled", "in-progress", "completed", "cancelled"],
            default: "scheduled",
        },
        notes: {
            type: String,
            maxlength: 3000,
        },
    },
    { timestamps: true }
);

export default mongoose.model("OperationTheatre", operationTheatreSchema);