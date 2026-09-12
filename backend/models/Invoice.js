import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        encounter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Encounter",
        },
        invoiceNumber: {
            type: String,
            unique: true,
        },
        items: [
            {
                description: String,
                category: {
                    type: String,
                    enum: ["consultation", "pharmacy", "lab", "room", "procedure", "nursing", "other"],
                },
                quantity: { type: Number, default: 1 },
                unitPrice: Number,
                amount: Number,
            },
        ],
        totalAmount: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        netPayable: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ["unpaid", "partial", "paid", "cancelled"],
            default: "unpaid",
        },
        insurancePayable: { type: Number, default: 0 },
        patientPayable: { type: Number, default: 0 },
    },
    { timestamps: true }
);

invoiceSchema.pre("save", async function () {
    if (this.invoiceNumber) return;
    const count = await mongoose.model("Invoice").countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;
});

export default mongoose.model("Invoice", invoiceSchema);