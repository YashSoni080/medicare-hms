import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
    {
        uhid: {
            type: String,
            unique: true,
            trim: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        address: {
            street: String,
            city: String,
            state: String,
            zip: String,
        },
        emergencyContact: {
            name: String,
            phone: String,
            relation: String,
        },
        medicalHistory: {
            type: [String], // ["Diabetes", "Hypertension", ...]
            default: [],
        },
        allergies: {
            type: [String],
            default: [],
        },
        insuranceId: {
            type: String,
            trim: true,
        },
        idProof: {
            type: String, // Government ID number (Aadhaar / PAN / Passport)
            trim: true,
        },
    },
    { timestamps: true }
);

// Auto-generate UHID: HOSP-YYYY-XXXXXX (sequential per year)
patientSchema.pre("save", async function () {
    if (this.uhid) return;
    const year = new Date().getFullYear();
    const count = await mongoose.model("Patient").countDocuments({
        uhid: { $regex: `^HOSP-${year}-` },
    });
    this.uhid = `HOSP-${year}-${String(count + 1).padStart(6, "0")}`;
});

export default mongoose.model("Patient", patientSchema);
