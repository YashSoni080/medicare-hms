import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        employeeId: {
            type: String,
            unique: true,
        },
        department: String,
        designation: String,
        joiningDate: Date,
        salary: Number,
        shift: {
            type: String,
            enum: ["morning", "evening", "night", "rotational"],
            default: "morning",
        },
        emergencyContact: String,
        address: String,
    },
    { timestamps: true }
);

const attendanceSchema = new mongoose.Schema(
    {
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        checkIn: Date,
        checkOut: Date,
        status: {
            type: String,
            enum: ["present", "absent", "leave", "half-day"],
            default: "present",
        },
        notes: String,
    },
    { timestamps: true }
);

staffSchema.pre("save", async function () {
    if (this.employeeId) return;
    const count = await mongoose.model("Staff").countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(4, "0")}`;
});

export default mongoose.model("Staff", staffSchema);
export const Attendance = mongoose.model("Attendance", attendanceSchema);