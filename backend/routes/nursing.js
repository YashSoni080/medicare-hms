import { Router } from "express";
import {
    getNursingData,
    createNursingTask,
    updateNursingTask,
    recordVitals,
} from "../controllers/nursingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getNursingData);
router.post("/tasks", protect, authorize("doctor", "admin"), createNursingTask);
router.put("/tasks/:id", protect, authorize("doctor", "admin"), updateNursingTask);
router.post("/vitals", protect, authorize("doctor", "admin"), recordVitals);

export default router;