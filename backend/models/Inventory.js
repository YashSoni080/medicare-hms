import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        sku: { type: String, unique: true },
        category: {
            type: String,
            enum: ["medicine", "consumable", "surgical", "reusable", "equipment"],
            default: "medicine",
        },
        unit: String, // "tablet", "bottle", "box", "ml"
        quantity: { type: Number, default: 0 },
        reorderLevel: { type: Number, default: 10 },
        batchNumber: String,
        expiryDate: Date,
        mrp: Number,
        purchasePrice: Number,
        sellingPrice: Number,
        store: {
            type: String,
            enum: ["central", "ward-pharmacy", "operation-theatre", "lab"],
            default: "central",
        },
    },
    { timestamps: true }
);

const purchaseOrderSchema = new mongoose.Schema(
    {
        poNumber: { type: String, unique: true },
        vendor: String,
        items: [
            {
                item: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
                name: String,
                quantity: Number,
                unitPrice: Number,
                amount: Number,
            },
        ],
        status: {
            type: String,
            enum: ["requisition", "quotation", "ordered", "received", "cancelled"],
            default: "requisition",
        },
        totalAmount: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

purchaseOrderSchema.pre("save", async function () {
    if (this.poNumber) return;
    const count = await mongoose.model("PurchaseOrder").countDocuments();
    this.poNumber = `PO-${String(count + 1).padStart(6, "0")}`;
});

export default mongoose.model("InventoryItem", inventoryItemSchema);
export const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);