import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        specialization: {
            type: String,
            required: [true, "Specialization is required"],
            trim: true,
        },
        department: {
            type: String,
            trim: true,
        },
        experience: {
            type: Number, // years
            default: 0,
        },
        qualifications: {
            type: [String],
            default: [],
        },
        consultationFee: {
            type: Number,
            default: 0,
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        availableDays: {
            type: [String], // ["Monday", "Tuesday", ...]
            default: [],
        },
        availableTimeSlots: {
            type: [{ start: String, end: String }], // [{ start: "09:00", end: "13:00" }]
            default: [],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
