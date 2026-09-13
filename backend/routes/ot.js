import { Router } from "express";
import {
    getSurgeries,
    createSurgery,
    updateSurgery,
} from "../controllers/otController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getSurgeries);
router.post("/", protect, authorize("doctor", "admin"), createSurgery);
router.put("/:id", protect, authorize("doctor", "admin"), updateSurgery);

export default router;