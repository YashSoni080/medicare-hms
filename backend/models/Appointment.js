import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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
        date: {
            type: Date,
            required: [true, "Appointment date is required"],
        },
        timeSlot: {
            start: { type: String, required: true }, // "10:30"
            end: { type: String, required: true }, // "11:00"
        },
        reason: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "pending",
        },
        notes: {
            type: String, // doctor's notes after the visit
            maxlength: 2000,
        },
    },
    { timestamps: true }
);

// Prevent double-booking: only one confirmed/pending appointment per doctor+date+timeSlot
appointmentSchema.index(
    { doctor: 1, date: 1, "timeSlot.start": 1, status: 1 },
    {
        partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
        unique: true,
    }
);

export default mongoose.model("Appointment", appointmentSchema);
