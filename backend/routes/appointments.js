import { Router } from "express";
import {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    deleteAppointment,
} from "../controllers/appointmentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(protect);

// Any authenticated user (controller filters by role)
router.get("/", getAppointments);
router.get("/:id", getAppointment);

// Patient, receptionist, admin can create
router.post("/", authorize("patient", "receptionist", "admin"), createAppointment);

// Doctor, receptionist, admin can change status
router.put("/:id/status", authorize("doctor", "receptionist", "admin"), updateAppointmentStatus);

// Patient, receptionist, admin can reschedule
router.put("/:id", authorize("patient", "receptionist", "admin"), rescheduleAppointment);

// Admin only
router.delete("/:id", authorize("admin"), deleteAppointment);

export default router;
