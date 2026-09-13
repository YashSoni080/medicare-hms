import EmergencyCase from "../models/Emergency.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/emergency  (protected)
 * Query: ?status=triage
 */
export const getEmergencyCases = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        }

        const cases = await EmergencyCase.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name phone" } })
            .populate("doctor", "specialization")
            .sort({ createdAt: -1 });

        res.json({ count: cases.length, cases });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/emergency  (protected — receptionist, doctor, admin)
 * Body: { patient, arrivalMode, triageLevel, chiefComplaint, vitals }
 */
export const createEmergencyCase = async (req, res, next) => {
    try {
        const { patient, arrivalMode, triageLevel, chiefComplaint, vitals } = req.body;
        if (!patient || !chiefComplaint) {
            return res.status(400).json({ message: "Patient and chief complaint are required" });
        }

        const emergencyCase = await EmergencyCase.create({
            patient,
            arrivalMode,
            triageLevel,
            chiefComplaint,
            vitals,
        });

        res.status(201).json({ emergencyCase });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/emergency/:id  (protected — doctor, admin)
 * Body: { status, condition, treatmentNotes, doctor, triageLevel }
 */
export const updateEmergencyCase = async (req, res, next) => {
    try {
        const emergencyCase = await EmergencyCase.findById(req.params.id);
        if (!emergencyCase) return res.status(404).json({ message: "Emergency case not found" });

        const allowed = ["status", "condition", "treatmentNotes", "doctor", "triageLevel", "vitals"];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) emergencyCase[field] = req.body[field];
        });

        if (req.body.status === "discharged") emergencyCase.dischargedAt = new Date();

        await emergencyCase.save();
        res.json({ emergencyCase });
    } catch (error) {
        next(error);
    }
};