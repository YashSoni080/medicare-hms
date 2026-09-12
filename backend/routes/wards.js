import { Router } from "express";
import {
    getWards,
    createWard,
    createAdmission,
    getAdmissions,
    dischargePatient,
    updateBedStatus,
} from "../controllers/wardController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getWards);
router.post("/", protect, authorize("admin"), createWard);

router.get("/admissions", protect, getAdmissions);
router.post("/admissions", protect, authorize("doctor", "receptionist", "admin"), createAdmission);
router.put("/admissions/:id/discharge", protect, authorize("doctor", "admin"), dischargePatient);

router.put("/beds/:id/status", protect, authorize("admin", "receptionist"), updateBedStatus);

export default router;