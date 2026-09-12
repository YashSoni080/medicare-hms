import { Router } from "express";
import {
    getInventory,
    createInventoryItem,
    updateInventoryItem,
    createPurchaseOrder,
    receivePurchaseOrder,
    getPurchaseOrders,
} from "../controllers/inventoryController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getInventory);
router.get("/purchase-orders", protect, getPurchaseOrders);

router.post("/", protect, authorize("admin", "pharmacist"), createInventoryItem);
router.post("/purchase-orders", protect, authorize("admin", "pharmacist"), createPurchaseOrder);

router.put("/:id", protect, authorize("admin", "pharmacist"), updateInventoryItem);
router.put("/purchase-orders/:id/receive", protect, authorize("admin", "pharmacist"), receivePurchaseOrder);

export default router;