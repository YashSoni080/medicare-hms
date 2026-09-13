import mongoose from "mongoose";

const bloodUnitSchema = new mongoose.Schema(
    {
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            required: true,
        },
        component: {
            type: String,
            enum: ["whole-blood", "packed-rbc", "plasma", "platelets", "cryoprecipitate"],
            default: "whole-blood",
        },
        donorName: String,
        donorId: String,
        collectionDate: Date,
        expiryDate: Date,
        status: {
            type: String,
            enum: ["available", "reserved", "issued", "expired", "discarded"],
            default: "available",
        },
        issuedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
        },
    },
    { timestamps: true }
);

const bloodRequestSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            required: true,
        },
        units: {
            type: Number,
            default: 1,
            min: 1,
        },
        reason: {
            type: String,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "issued", "rejected"],
            default: "pending",
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("BloodUnit", bloodUnitSchema);
export const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);