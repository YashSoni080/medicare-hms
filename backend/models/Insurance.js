import mongoose from "mongoose";

const insurancePolicySchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        tpaName: { type: String, required: true }, // Third Party Administrator
        policyNumber: String,
        coverageCap: Number,
        deductible: { type: Number, default: 0 },
        coPayPercent: { type: Number, default: 0 },
        exclusions: [String],
        validFrom: Date,
        validTo: Date,
    },
    { timestamps: true }
);

const claimSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        policy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InsurancePolicy",
        },
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Invoice",
        },
        claimNumber: { type: String, unique: true },
        amount: Number,
        status: {
            type: String,
            enum: ["requested", "query-raised", "approved", "rejected", "settlement-pending", "settled"],
            default: "requested",
        },
        documents: [String],
        remarks: String,
    },
    { timestamps: true }
);

claimSchema.pre("save", async function () {
    if (this.claimNumber) return;
    const count = await mongoose.model("Claim").countDocuments();
    this.claimNumber = `CLM-${String(count + 1).padStart(6, "0")}`;
});

export default mongoose.model("InsurancePolicy", insurancePolicySchema);
export const Claim = mongoose.model("Claim", claimSchema);