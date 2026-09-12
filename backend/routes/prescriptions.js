import { Router } from "express";
import {
    getPrescriptions,
    createPrescription,
    dispensePrescription,
    deletePrescription,
} from "../controllers/prescriptionController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router
    .route("/")
    .get(protect, getPrescriptions)
    .post(protect, authorize("doctor", "admin"), createPrescription);

router.put("/:id/dispense", protect, authorize("pharmacist", "admin"), dispensePrescription);
router.delete("/:id", protect, authorize("admin"), deletePrescription);

export default router;