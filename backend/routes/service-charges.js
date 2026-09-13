import { Router } from "express";
import {
    getServiceCharges,
    createServiceCharge,
    updateServiceCharge,
    deleteServiceCharge,
} from "../controllers/serviceChargeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getServiceCharges);
router.post("/", protect, authorize("admin"), createServiceCharge);
router.put("/:id", protect, authorize("admin"), updateServiceCharge);
router.delete("/:id", protect, authorize("admin"), deleteServiceCharge);

export default router;