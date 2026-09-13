import { Router } from "express";
import {
    getStaff,
    createStaff,
    updateStaff,
    recordAttendance,
    getAttendance,
} from "../controllers/staffController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getStaff);
router.post("/", protect, authorize("admin"), createStaff);
router.put("/:id", protect, authorize("admin"), updateStaff);
router.get("/attendance", protect, getAttendance);
router.post("/attendance", protect, authorize("admin"), recordAttendance);

export default router;