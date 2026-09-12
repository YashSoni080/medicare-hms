import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        invoice: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Invoice",
            required: true,
        },
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        paymentMode: {
            type: String,
            enum: ["cash", "card", "upi", "netbanking", "insurance", "cheque"],
            required: true,
        },
        transactionReference: String,
        amountPaid: { type: Number, required: true },
        isDeposit: { type: Boolean, default: false }, // advance/deposit payment
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);