import Teleconsultation from "../models/Telemedicine.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/telemedicine  (protected)
 * Query: ?status=scheduled
 */
export const getTeleconsultations = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        }

        const consultations = await Teleconsultation.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name phone" } })
            .populate("doctor", "specialization")
            .sort({ scheduledAt: -1 });

        res.json({ count: consultations.length, consultations });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/telemedicine  (protected — doctor, receptionist, admin)
 * Body: { patient, doctor, scheduledAt, durationMinutes, mode }
 */
export const createTeleconsultation = async (req, res, next) => {
    try {
        const { patient, doctor, scheduledAt, durationMinutes, mode } = req.body;
        if (!patient || !doctor || !scheduledAt) {
            return res.status(400).json({ message: "Patient, doctor and scheduled time are required" });
        }

        const consultation = await Teleconsultation.create({
            patient,
            doctor,
            scheduledAt,
            durationMinutes,
            mode,
            meetingUrl: `https://meet.medicare.local/${Date.now().toString(36)}`,
        });

        res.status(201).json({ consultation });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/telemedicine/:id  (protected — doctor, admin)
 * Body: { status, consultationNotes }
 */
export const updateTeleconsultation = async (req, res, next) => {
    try {
        const consultation = await Teleconsultation.findById(req.params.id);
        if (!consultation) return res.status(404).json({ message: "Teleconsultation not found" });

        if (req.body.status) consultation.status = req.body.status;
        if (req.body.consultationNotes) consultation.consultationNotes = req.body.consultationNotes;

        await consultation.save();
        res.json({ consultation });
    } catch (error) {
        next(error);
    }
};