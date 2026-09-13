import { Router } from "express";
import {
    getHousekeepingData,
    createHousekeepingTask,
    updateHousekeepingTask,
    addLinenItem,
    updateLinenItem,
    addWasteRecord,
} from "../controllers/housekeepingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getHousekeepingData);
router.post("/tasks", protect, authorize("admin", "receptionist"), createHousekeepingTask);
router.put("/tasks/:id", protect, authorize("admin"), updateHousekeepingTask);
router.post("/linen", protect, authorize("admin"), addLinenItem);
router.put("/linen/:id", protect, authorize("admin"), updateLinenItem);
router.post("/waste", protect, authorize("admin"), addWasteRecord);

export default router;