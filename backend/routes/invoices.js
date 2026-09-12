import { Router } from "express";
import {
    getInvoices,
    createInvoice,
    payInvoice,
    deleteInvoice,
} from "../controllers/billingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router
    .route("/")
    .get(protect, getInvoices)
    .post(protect, authorize("receptionist", "admin"), createInvoice);

router.post("/:id/pay", protect, authorize("receptionist", "admin"), payInvoice);
router.delete("/:id", protect, authorize("admin"), deleteInvoice);

export default router;