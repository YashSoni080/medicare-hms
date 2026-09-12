import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        action: {
            type: String,
            enum: ["CREATE", "READ", "UPDATE", "DELETE", "LOGIN", "LOGOUT"],
            required: true,
        },
        entityName: { type: String, required: true },
        entityId: String,
        oldValues: mongoose.Schema.Types.Mixed,
        newValues: mongoose.Schema.Types.Mixed,
        ipAddress: String,
        userAgent: String,
    },
    { timestamps: true }
);

// Immutable — no update/delete operations allowed
auditLogSchema.pre("save", function () {
    this.isNew = true;
});

export default mongoose.model("AuditLog", auditLogSchema);