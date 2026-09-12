import InventoryItem, { PurchaseOrder } from "../models/Inventory.js";

/**
 * GET /api/inventory  (protected)
 * Query: ?category=medicine&store=central&lowStock=true
 */
export const getInventory = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.store) filter.store = req.query.store;
        if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };

        let items = await InventoryItem.find(filter).sort({ name: 1 });

        if (req.query.lowStock === "true") {
            items = items.filter((i) => i.quantity <= i.reorderLevel);
        }

        res.json({ count: items.length, items });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/inventory  (protected — admin, pharmacist)
 * Body: { name, sku, category, unit, quantity, reorderLevel, batchNumber, expiryDate, mrp, purchasePrice, sellingPrice, store }
 */
export const createInventoryItem = async (req, res, next) => {
    try {
        const item = await InventoryItem.create(req.body);
        res.status(201).json({ item });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/inventory/:id  (protected — admin, pharmacist)
 * Updates stock quantity (adjustment) or item details.
 */
export const updateInventoryItem = async (req, res, next) => {
    try {
        const item = await InventoryItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        const allowed = [
            "name",
            "category",
            "unit",
            "quantity",
            "reorderLevel",
            "batchNumber",
            "expiryDate",
            "mrp",
            "purchasePrice",
            "sellingPrice",
            "store",
        ];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) item[field] = req.body[field];
        });

        await item.save();
        res.json({ item });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/purchase-orders  (protected — admin, pharmacist)
 * Body: { vendor, items: [{item, name, quantity, unitPrice}] }
 */
export const createPurchaseOrder = async (req, res, next) => {
    try {
        const { vendor, items } = req.body;
        if (!vendor || !items?.length) {
            return res.status(400).json({ message: "Vendor and items are required" });
        }

        const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const po = await PurchaseOrder.create({
            vendor,
            items,
            totalAmount,
            createdBy: req.user._id,
        });

        res.status(201).json({ purchaseOrder: po });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/purchase-orders/:id/receive  (protected — admin, pharmacist)
 * Marks PO as received and increments inventory quantities.
 */
export const receivePurchaseOrder = async (req, res, next) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) return res.status(404).json({ message: "Purchase order not found" });

        po.status = "received";
        await po.save();

        for (const line of po.items) {
            if (line.item) {
                const inv = await InventoryItem.findById(line.item);
                if (inv) {
                    inv.quantity += line.quantity;
                    await inv.save();
                }
            }
        }

        res.json({ purchaseOrder: po });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/purchase-orders  (protected)
 */
export const getPurchaseOrders = async (req, res, next) => {
    try {
        const orders = await PurchaseOrder.find()
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
        res.json({ count: orders.length, purchaseOrders: orders });
    } catch (error) {
        next(error);
    }
};