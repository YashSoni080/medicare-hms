import Encounter from "../models/Encounter.js";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

/**
 * GET /api/encounters  (protected)
 * Role-filtered: patient→own, doctor→own, admin/receptionist→all
 * Query: ?status=waiting&visitType=OPD&date=2026-09-11
 */
export const getEncounters = async (req, res, next) => {
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
        if (req.query.visitType) filter.visitType = req.query.visitType;
        if (req.query.date) {
            const start = new Date(req.query.date);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            filter.createdAt = { $gte: start, $lt: end };
        }

        const encounters = await Encounter.find(filter)
            .populate("patient", "uhid")
            .populate({
                path: "patient",
                populate: { path: "user", select: "name phone" },
            })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 });

        res.json({ count: encounters.length, encounters });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/encounters/:id  (protected)
 */
export const getEncounter = async (req, res, next) => {
    try {
        const encounter = await Encounter.findById(req.params.id)
            .populate({ path: "patient", populate: { path: "user", select: "name phone email" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name" } });

        if (!encounter) return res.status(404).json({ message: "Encounter not found" });

        // Role check
        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient || patient._id.toString() !== encounter.patient._id.toString()) {
                return res.status(403).json({ message: "Not authorized" });
            }
        } else if (req.user.role === "doctor") {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor || doctor._id.toString() !== encounter.doctor._id.toString()) {
                return res.status(403).json({ message: "Not authorized" });
            }
        }

        res.json({ encounter });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/encounters  (protected — doctor, receptionist, admin)
 * Body: { patient, doctor?, appointment?, visitType, vitals, chiefComplaints }
 * Creates an encounter and marks the appointment as in-consultation.
 */
export const createEncounter = async (req, res, next) => {
    try {
        const { patient, doctor, appointment, visitType, vitals, chiefComplaints } = req.body;

        if (!patient) return res.status(400).json({ message: "Patient is required" });

        let doctorId = doctor;
        if (req.user.role === "doctor") {
            const doc = await Doctor.findOne({ user: req.user._id });
            if (!doc) return res.status(404).json({ message: "Doctor profile not found" });
            doctorId = doc._id;
        }
        if (!doctorId) return res.status(400).json({ message: "Doctor is required" });

        // Compute BMI if height & weight present
        let bmi;
        if (vitals?.height && vitals?.weight) {
            const hM = vitals.height / 100;
            bmi = Math.round((vitals.weight / (hM * hM)) * 10) / 10;
        }

        const encounter = await Encounter.create({
            patient,
            doctor: doctorId,
            appointment,
            visitType: visitType || "OPD",
            vitals: { ...vitals, bmi },
            chiefComplaints,
        });

        if (appointment) {
            await Appointment.findByIdAndUpdate(appointment, { status: "in-consultation" });
        }

        res.status(201).json({ encounter });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/encounters/:id  (protected — doctor, admin)
 * Updates vitals, complaints, diagnosis codes, notes, status.
 */
export const updateEncounter = async (req, res, next) => {
    try {
        const encounter = await Encounter.findById(req.params.id);
        if (!encounter) return res.status(404).json({ message: "Encounter not found" });

        if (req.user.role === "doctor") {
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor || doctor._id.toString() !== encounter.doctor.toString()) {
                return res.status(403).json({ message: "Not authorized" });
            }
        }

        const allowed = [
            "vitals",
            "chiefComplaints",
            "diagnosisCodes",
            "clinicalNotes",
            "status",
            "visitType",
        ];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) encounter[field] = req.body[field];
        });

        // Recompute BMI
        if (req.body.vitals?.height && req.body.vitals?.weight) {
            const hM = req.body.vitals.height / 100;
            encounter.vitals.bmi = Math.round((req.body.vitals.weight / (hM * hM)) * 10) / 10;
        }

        await encounter.save();
        res.json({ encounter });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/encounters/:id  (protected — admin)
 */
export const deleteEncounter = async (req, res, next) => {
    try {
        const encounter = await Encounter.findByIdAndDelete(req.params.id);
        if (!encounter) return res.status(404).json({ message: "Encounter not found" });
        res.json({ message: "Encounter deleted" });
    } catch (error) {
        next(error);
    }
};