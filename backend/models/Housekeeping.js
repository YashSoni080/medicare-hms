import mongoose from "mongoose";

const housekeepingTaskSchema = new mongoose.Schema(
    {
        area: {
            type: String,
            required: [true, "Area is required"],
            maxlength: 200,
        },
        taskType: {
            type: String,
            enum: ["cleaning", "linen-change", "waste-collection", "disinfection", "other"],
            default: "cleaning",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
        },
        completedAt: Date,
        notes: String,
    },
    { timestamps: true }
);

const linenItemSchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["in-stock", "in-use", "laundry", "damaged"],
            default: "in-stock",
        },
        location: String,
    },
    { timestamps: true }
);

const wasteRecordSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            enum: ["bio-medical", "sharp", "infectious", "pharmaceutical", "chemical", "general"],
            required: true,
        },
        quantityKg: {
            type: Number,
            default: 0,
        },
        collectedFrom: String,
        disposedAt: Date,
        disposalMethod: String,
        notes: String,
    },
    { timestamps: true }
);

export default mongoose.model("HousekeepingTask", housekeepingTaskSchema);
export const LinenItem = mongoose.model("LinenItem", linenItemSchema);
export const WasteRecord = mongoose.model("WasteRecord", wasteRecordSchema);