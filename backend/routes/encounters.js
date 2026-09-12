import { Router } from "express";
import {
    getEncounters,
    getEncounter,
    createEncounter,
    updateEncounter,
    deleteEncounter,
} from "../controllers/encounterController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router
    .route("/")
    .get(protect, getEncounters)
    .post(protect, authorize("doctor", "receptionist", "admin"), createEncounter);

router
    .route("/:id")
    .get(protect, getEncounter)
    .put(protect, authorize("doctor", "admin"), updateEncounter)
    .delete(protect, authorize("admin"), deleteEncounter);

export default router;