import { Router } from "express";
import { getAuditLogs, createAuditLog } from "../controllers/auditController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, authorize("admin"), getAuditLogs);
router.post("/", protect, createAuditLog);

export default router;