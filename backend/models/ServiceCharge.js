import mongoose from "mongoose";

const serviceChargeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Service name is required"],
            unique: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["consultation", "procedure", "room", "nursing", "lab", "radiology", "ot", "other"],
            default: "other",
        },
        charge: {
            type: Number,
            required: true,
            min: 0,
        },
        description: String,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("ServiceCharge", serviceChargeSchema);