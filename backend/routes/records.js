import { Router } from "express";
import {
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord,
} from "../controllers/recordController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Any authenticated user (controller filters by role)
router.get("/", getRecords);
router.get("/:id", getRecord);

// Doctor, admin can create
router.post("/", authorize("doctor", "admin"), createRecord);

// Doctor (own records), admin can update
router.put("/:id", authorize("doctor", "admin"), updateRecord);

// Admin only
router.delete("/:id", authorize("admin"), deleteRecord);

export default router;
