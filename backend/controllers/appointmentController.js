import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/appointments  (protected)
 * Admin / receptionist → all appointments
 * Doctor              → own appointments
 * Patient             → own appointments
 * Query: ?status=confirmed&from=2026-09-01&to=2026-09-30
 */
export const getAppointments = async (req, res, next) => {
    try {
        const filter = {};

        // Role-based filtering
        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (patient) filter.patient = patient._id;
        } else if (req.user.role === "doctor") {
            const { default: Doctor } = await import("../models/Doctor.js");
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (doctor) filter.doctor = doctor._id;
        }
        // admin & receptionist see everything

        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.from || req.query.to) {
            filter.date = {};
            if (req.query.from) filter.date.$gte = new Date(req.query.from);
            if (req.query.to) filter.date.$lte = new Date(req.query.to);
        }

        const appointments = await Appointment.find(filter)
            .populate({
                path: "patient",
                populate: { path: "user", select: "name email phone" },
            })
            .populate({
                path: "doctor",
                populate: { path: "user", select: "name email" },
            })
            .sort({ date: 1, "timeSlot.start": 1 });

        res.json({ count: appointments.length, appointments });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/appointments/:id
 */
export const getAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name email" } });

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Patient can only see own
        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (patient && appointment.patient._id.toString() !== patient._id.toString()) {
                return res.status(403).json({ message: "Not authorized" });
            }
        }

        res.json({ appointment });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/appointments  (protected — patient, receptionist, admin)
 * Body: { patientId, doctorId, date, timeSlot: { start, end }, reason? }
 */
export const createAppointment = async (req, res, next) => {
    try {
        const { patientId, doctorId, date, timeSlot, reason } = req.body;

        if (!patientId || !doctorId || !date || !timeSlot) {
            return res.status(400).json({ message: "patientId, doctorId, date, and timeSlot are required" });
        }

        // Patients can only book for themselves
        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient || patient._id.toString() !== patientId) {
                return res.status(403).json({ message: "You can only book appointments for yourself" });
            }
        }

        const appointment = await Appointment.create({
            patient: patientId,
            doctor: doctorId,
            date,
            timeSlot,
            reason,
            status: "pending",
        });

        const populated = await appointment.populate([
            { path: "patient", populate: { path: "user", select: "name email phone" } },
            { path: "doctor", populate: { path: "user", select: "name email" } },
        ]);

        res.status(201).json({ appointment: populated });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/appointments/:id/status  (protected)
 * Body: { status: "confirmed" | "cancelled" | "completed" }
 * Doctor can confirm / complete their own; admin / receptionist can do any.
 */
export const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "confirmed", "cancelled", "completed"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Doctor can only manage their own appointments
        if (req.user.role === "doctor") {
            const { default: Doctor } = await import("../models/Doctor.js");
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
                return res.status(403).json({ message: "Not authorized" });
            }
        }

        appointment.status = status;
        await appointment.save();

        const populated = await appointment
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name email" } });

        res.json({ appointment: populated });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/appointments/:id  (reschedule — change date/time)
 * Body: { date?, timeSlot? }
 */
export const rescheduleAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.status === "completed" || appointment.status === "cancelled") {
            return res.status(400).json({ message: "Cannot reschedule a completed or cancelled appointment" });
        }

        if (req.body.date) appointment.date = req.body.date;
        if (req.body.timeSlot) appointment.timeSlot = req.body.timeSlot;
        appointment.status = "pending"; // reset to pending after reschedule

        await appointment.save();

        const populated = await appointment
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name email" } });

        res.json({ appointment: populated });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/appointments/:id  (admin only)
 */
export const deleteAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        await appointment.deleteOne();
        res.json({ message: "Appointment deleted" });
    } catch (error) {
        next(error);
    }
};
