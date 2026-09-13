import { Router } from "express";
import {
    getAmbulanceData,
    createAmbulance,
    updateAmbulance,
    createTrip,
    updateTrip,
} from "../controllers/ambulanceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getAmbulanceData);
router.post("/", protect, authorize("admin"), createAmbulance);
router.put("/:id", protect, authorize("admin"), updateAmbulance);
router.post("/trips", protect, authorize("receptionist", "admin"), createTrip);
router.put("/trips/:id", protect, authorize("receptionist", "admin"), updateTrip);

export default router;