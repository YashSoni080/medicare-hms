import mongoose from "mongoose";

const labOrderSchema = new mongoose.Schema(
    {
        encounter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Encounter",
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
        },
        testName: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["pathology", "radiology", "microbiology", "other"],
            default: "pathology",
        },
        barcode: {
            type: String,
            unique: true,
        },
        status: {
            type: String,
            enum: [
                "ordered",
                "sample-collected",
                "received",
                "processing",
                "verified",
                "published",
                "cancelled",
            ],
            default: "ordered",
        },
        resultData: [
            {
                parameter: String,
                value: String,
                unit: String,
                normalRange: String,
                flag: String, // "normal" | "high" | "low" | "critical"
            },
        ],
        criticalAlert: {
            type: Boolean,
            default: false,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        notes: String,
    },
    { timestamps: true }
);

// Auto-generate barcode: LAB-YYYYMMDD-XXXXXX
labOrderSchema.pre("save", async function () {
    if (this.barcode) return;
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(
        date.getDate()
    ).padStart(2, "0")}`;
    const count = await mongoose.model("LabOrder").countDocuments({
        barcode: { $regex: `^LAB-${ymd}-` },
    });
    this.barcode = `LAB-${ymd}-${String(count + 1).padStart(6, "0")}`;
});

export default mongoose.model("LabOrder", labOrderSchema);