import { Router } from "express";
import {
    getBloodBank,
    addBloodUnit,
    createBloodRequest,
    updateBloodRequest,
    updateBloodUnitStatus,
} from "../controllers/bloodBankController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getBloodBank);
router.post("/units", protect, authorize("admin", "lab-tech"), addBloodUnit);
router.put("/units/:id/status", protect, authorize("admin", "lab-tech"), updateBloodUnitStatus);
router.post("/requests", protect, authorize("doctor", "admin"), createBloodRequest);
router.put("/requests/:id", protect, authorize("admin", "lab-tech"), updateBloodRequest);

export default router;