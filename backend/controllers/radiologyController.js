import RadiologyOrder from "../models/Radiology.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/radiology  (protected)
 * Query: ?status=ordered
 */
export const getRadiologyOrders = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        }

        const orders = await RadiologyOrder.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name phone" } })
            .populate("doctor", "specialization")
            .sort({ createdAt: -1 });

        res.json({ count: orders.length, orders });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/radiology  (protected — doctor, admin)
 * Body: { patient, doctor, modality, bodyPart, clinicalHistory }
 */
export const createRadiologyOrder = async (req, res, next) => {
    try {
        const { patient, doctor, modality, bodyPart, clinicalHistory } = req.body;
        if (!patient || !doctor || !modality) {
            return res.status(400).json({ message: "Patient, doctor and modality are required" });
        }

        const order = await RadiologyOrder.create({
            patient,
            doctor,
            modality,
            bodyPart,
            clinicalHistory,
        });

        res.status(201).json({ order });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/radiology/:id  (protected — doctor, admin, lab-tech)
 * Body: { status, findings, impression, reportReady }
 */
export const updateRadiologyOrder = async (req, res, next) => {
    try {
        const order = await RadiologyOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Radiology order not found" });

        const allowed = ["status", "findings", "impression", "reportReady"];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) order[field] = req.body[field];
        });

        await order.save();
        res.json({ order });
    } catch (error) {
        next(error);
    }
};