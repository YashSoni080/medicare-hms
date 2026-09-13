import { Router } from "express";
import {
    getOverviewReport,
    getRevenueReport,
    getClinicalReport,
    getOperationsReport,
} from "../controllers/reportController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/overview", protect, authorize("admin"), getOverviewReport);
router.get("/revenue", protect, authorize("admin"), getRevenueReport);
router.get("/clinical", protect, authorize("admin"), getClinicalReport);
router.get("/operations", protect, authorize("admin"), getOperationsReport);

export default router;