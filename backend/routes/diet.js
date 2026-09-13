import { Router } from "express";
import {
    getDietPlans,
    createDietPlan,
    updateDietPlan,
} from "../controllers/dietController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getDietPlans);
router.post("/", protect, authorize("doctor", "admin"), createDietPlan);
router.put("/:id", protect, authorize("doctor", "admin"), updateDietPlan);

export default router;