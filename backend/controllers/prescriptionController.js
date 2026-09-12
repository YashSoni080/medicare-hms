import Prescription from "../models/Prescription.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import InventoryItem from "../models/Inventory.js";

/**
 * GET /api/prescriptions  (protected)
 * Role-filtered. Query: ?status=pending&patient=ID
 */
export const getPrescriptions = async (req, res, next) => {
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

        const prescriptions = await Prescription.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .populate("encounter", "chiefComplaints")
            .sort({ createdAt: -1 });

        res.json({ count: prescriptions.length, prescriptions });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/prescriptions  (protected — doctor, admin)
 * Body: { encounter, patient, items: [{name, dosage, frequency, durationDays, route, instructions}] }
 */
export const createPrescription = async (req, res, next) => {
    try {
        const { encounter, patient, items } = req.body;
        if (!patient || !items?.length) {
            return res.status(400).json({ message: "Patient and items are required" });
        }

        let doctorId;
        if (req.user.role === "doctor") {
            const doc = await Doctor.findOne({ user: req.user._id });
            if (!doc) return res.status(404).json({ message: "Doctor profile not found" });
            doctorId = doc._id;
        } else {
            doctorId = req.body.doctor;
        }

        const prescription = await Prescription.create({
            encounter,
            patient,
            doctor: doctorId,
            items,
        });

        res.status(201).json({ prescription });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/prescriptions/:id/dispense  (protected — pharmacist, admin)
 * Marks as dispensed and decrements inventory.
 */
export const dispensePrescription = async (req, res, next) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) return res.status(404).json({ message: "Prescription not found" });

        prescription.status = "dispensed";
        await prescription.save();

        // Decrement inventory for each item
        for (const item of prescription.items) {
            const inv = await InventoryItem.findOne({ name: item.name });
            if (inv) {
                inv.quantity = Math.max(0, inv.quantity - 1);
                await inv.save();
            }
        }

        res.json({ prescription });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/prescriptions/:id  (protected — admin)
 */
export const deletePrescription = async (req, res, next) => {
    try {
        const prescription = await Prescription.findByIdAndDelete(req.params.id);
        if (!prescription) return res.status(404).json({ message: "Prescription not found" });
        res.json({ message: "Prescription deleted" });
    } catch (error) {
        next(error);
    }
};