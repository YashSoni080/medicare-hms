import { Router } from "express";
import { getPatients, getPatient, updatePatient, deletePatient } from "../controllers/patientController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// Protected — admin, doctor, receptionist can list; patients get their own
router.get("/", protect, authorize("admin", "doctor", "receptionist"), getPatients);

// Protected — any authenticated user (controller enforces per-patient access)
router.get("/:id", protect, getPatient);

// Protected — patients update own; admin/receptionist update anyone
router.put("/:id", protect, authorize("admin", "receptionist", "patient"), updatePatient);

// Protected — admin only
router.delete("/:id", protect, authorize("admin"), deletePatient);

export default router;
