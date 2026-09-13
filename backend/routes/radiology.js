import { Router } from "express";
import {
    getRadiologyOrders,
    createRadiologyOrder,
    updateRadiologyOrder,
} from "../controllers/radiologyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getRadiologyOrders);
router.post("/", protect, authorize("doctor", "admin"), createRadiologyOrder);
router.put("/:id", protect, authorize("doctor", "admin", "lab-tech"), updateRadiologyOrder);

export default router;