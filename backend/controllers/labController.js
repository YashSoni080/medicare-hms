import LabOrder from "../models/LabOrder.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

/**
 * GET /api/lab-orders  (protected)
 * Role-filtered. Query: ?status=processing&patient=ID
 */
export const getLabOrders = async (req, res, next) => {
    try {
        const filter = {};

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        } else if (req.user.role === "doctor") {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
            filter.doctor = doctor._id;
        }

        if (req.query.status) filter.status = req.query.status;
        if (req.query.patient) filter.patient = req.query.patient;

        const orders = await LabOrder.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 });

        res.json({ count: orders.length, labOrders: orders });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/lab-orders  (protected — doctor, admin)
 * Body: { patient, doctor?, encounter?, testName, category }
 */
export const createLabOrder = async (req, res, next) => {
    try {
        const { patient, doctor, encounter, testName, category } = req.body;
        if (!patient || !testName) {
            return res.status(400).json({ message: "Patient and testName are required" });
        }

        let doctorId = doctor;
        if (req.user.role === "doctor") {
            const doc = await Doctor.findOne({ user: req.user._id });
            if (!doc) return res.status(404).json({ message: "Doctor profile not found" });
            doctorId = doc._id;
        }

        const order = await LabOrder.create({
            patient,
            doctor: doctorId,
            encounter,
            testName,
            category: category || "pathology",
        });

        res.status(201).json({ labOrder: order });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/lab-orders/:id/status  (protected — lab tech, doctor, admin)
 * Body: { status, resultData?, verifiedBy? }
 * Auto-flags critical values and sets criticalAlert.
 */
export const updateLabOrderStatus = async (req, res, next) => {
    try {
        const order = await LabOrder.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Lab order not found" });

        const { status, resultData } = req.body;
        if (status) order.status = status;

        if (resultData) {
            order.resultData = resultData;
            // Simple critical flag: value outside normal range → flag
            order.criticalAlert = resultData.some((r) => r.flag === "critical");
        }

        if (status === "verified") {
            order.verifiedBy = req.user._id;
        }

        await order.save();
        res.json({ labOrder: order });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/lab-orders/:id  (protected — admin)
 */
export const deleteLabOrder = async (req, res, next) => {
    try {
        const order = await LabOrder.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: "Lab order not found" });
        res.json({ message: "Lab order deleted" });
    } catch (error) {
        next(error);
    }
};