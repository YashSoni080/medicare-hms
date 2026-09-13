import { Router } from "express";
import {
    getEmergencyCases,
    createEmergencyCase,
    updateEmergencyCase,
} from "../controllers/emergencyController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getEmergencyCases);
router.post("/", protect, authorize("receptionist", "doctor", "admin"), createEmergencyCase);
router.put("/:id", protect, authorize("doctor", "admin"), updateEmergencyCase);

export default router;