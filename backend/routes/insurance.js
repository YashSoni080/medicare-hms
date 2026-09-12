import { Router } from "express";
import {
    getPolicies,
    createPolicy,
    getClaims,
    createClaim,
    updateClaimStatus,
} from "../controllers/insuranceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router
    .route("/policies")
    .get(protect, getPolicies)
    .post(protect, authorize("admin", "receptionist"), createPolicy);

router
    .route("/claims")
    .get(protect, getClaims)
    .post(protect, authorize("admin", "receptionist"), createClaim);

router.put("/claims/:id/status", protect, authorize("admin"), updateClaimStatus);

export default router;