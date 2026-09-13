import { Router } from "express";
import {
    getTeleconsultations,
    createTeleconsultation,
    updateTeleconsultation,
} from "../controllers/telemedicineController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getTeleconsultations);
router.post("/", protect, authorize("doctor", "receptionist", "admin"), createTeleconsultation);
router.put("/:id", protect, authorize("doctor", "admin"), updateTeleconsultation);

export default router;