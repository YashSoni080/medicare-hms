import { Router } from "express";
import {
    getLabOrders,
    createLabOrder,
    updateLabOrderStatus,
    deleteLabOrder,
} from "../controllers/labController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router
    .route("/")
    .get(protect, getLabOrders)
    .post(protect, authorize("doctor", "admin"), createLabOrder);

router.put("/:id/status", protect, authorize("lab-tech", "doctor", "admin"), updateLabOrderStatus);
router.delete("/:id", protect, authorize("admin"), deleteLabOrder);

export default router;