import { Router } from "express";
import { getDoctors, getDoctor, updateDoctor, deleteDoctor } from "../controllers/doctorController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", getDoctors);
router.get("/:id", getDoctor);

// Protected — admin or the doctor themselves
router.put("/:id", protect, authorize("admin", "doctor"), updateDoctor);

// Protected — admin only
router.delete("/:id", protect, authorize("admin"), deleteDoctor);

export default router;
