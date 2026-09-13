import OperationTheatre from "../models/OperationTheatre.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/ot  (protected)
 * Query: ?status=scheduled
 */
export const getSurgeries = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        }

        const surgeries = await OperationTheatre.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name phone" } })
            .populate("surgeon", "specialization")
            .sort({ scheduledDate: -1 });

        res.json({ count: surgeries.length, surgeries });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/ot  (protected — doctor, admin)
 * Body: { patient, surgeon, procedure, otRoom, scheduledDate, startTime, endTime, anesthesiaType, notes }
 */
export const createSurgery = async (req, res, next) => {
    try {
        const { patient, surgeon, procedure, otRoom, scheduledDate, startTime, endTime, anesthesiaType, notes } = req.body;
        if (!patient || !surgeon || !procedure || !scheduledDate) {
            return res.status(400).json({ message: "Patient, surgeon, procedure and date are required" });
        }

        const surgery = await OperationTheatre.create({
            patient,
            surgeon,
            procedure,
            otRoom,
            scheduledDate,
            startTime,
            endTime,
            anesthesiaType,
            notes,
        });

        res.status(201).json({ surgery });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/ot/:id  (protected — doctor, admin)
 * Body: { status, notes, startTime, endTime }
 */
export const updateSurgery = async (req, res, next) => {
    try {
        const surgery = await OperationTheatre.findById(req.params.id);
        if (!surgery) return res.status(404).json({ message: "Surgery not found" });

        const allowed = ["status", "notes", "startTime", "endTime", "otRoom", "anesthesiaType"];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) surgery[field] = req.body[field];
        });

        await surgery.save();
        res.json({ surgery });
    } catch (error) {
        next(error);
    }
};