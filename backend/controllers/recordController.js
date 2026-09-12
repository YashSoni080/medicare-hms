import MedicalRecord from "../models/MedicalRecord.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/records  (protected)
 * Patient  → own records only
 * Doctor   → records for their patients
 * Admin    → all records
 * Query: ?patientId=...&type=diagnosis
 */
export const getRecords = async (req, res, next) => {
    try {
        const filter = {};

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (patient) filter.patient = patient._id;
        }

        if (req.query.patientId) {
            filter.patient = req.query.patientId;
        }
        if (req.query.type) {
            filter.type = req.query.type;
        }
        if (req.query.doctorId) {
            filter.doctor = req.query.doctorId;
        }

        const records = await MedicalRecord.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
            .populate("appointment")
            .sort({ createdAt: -1 });

        res.json({ count: records.length, records });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/records/:id
 */
export const getRecord = async (req, res, next) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
            .populate("appointment");

        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        // Patients can only see own records
        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (patient && record.patient._id.toString() !== patient._id.toString()) {
                return res.status(403).json({ message: "Not authorized" });
            }
        }

        res.json({ record });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/records  (protected — doctor, admin)
 * Body: { patientId, appointmentId?, type, title, description?, diagnosis?, prescription?, labResults? }
 */
export const createRecord = async (req, res, next) => {
    try {
        const { patientId, appointmentId, type, title, description, diagnosis, prescription, labResults } =
            req.body;

        if (!patientId || !type || !title) {
            return res.status(400).json({ message: "patientId, type, and title are required" });
        }

        // Determine which doctor doc belongs to this user
        let doctorId;
        if (req.user.role === "doctor") {
            const { default: Doctor } = await import("../models/Doctor.js");
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor) {
                return res.status(400).json({ message: "Doctor profile not found" });
            }
            doctorId = doctor._id;
        } else if (req.body.doctorId) {
            doctorId = req.body.doctorId; // admin can specify
        } else {
            return res.status(400).json({ message: "doctorId is required for admin-created records" });
        }

        const record = await MedicalRecord.create({
            patient: patientId,
            doctor: doctorId,
            appointment: appointmentId || undefined,
            type,
            title,
            description,
            diagnosis,
            prescription,
            labResults,
        });

        const populated = await record.populate([
            { path: "patient", populate: { path: "user", select: "name email phone" } },
            { path: "doctor", populate: { path: "user", select: "name email" } },
        ]);

        res.status(201).json({ record: populated });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/records/:id  (protected — doctor who owns the record, or admin)
 */
export const updateRecord = async (req, res, next) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        // Only admin or the owning doctor may update
        if (req.user.role === "doctor") {
            const { default: Doctor } = await import("../models/Doctor.js");
            const doctor = await Doctor.findOne({ user: req.user._id });
            if (!doctor || record.doctor.toString() !== doctor._id.toString()) {
                return res.status(403).json({ message: "Not authorized to edit this record" });
            }
        } else if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        const allowedFields = ["title", "description", "diagnosis", "prescription", "labResults", "attachments"];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                record[field] = req.body[field];
            }
        });

        await record.save();

        const populated = await record
            .populate({ path: "patient", populate: { path: "user", select: "name email phone" } })
            .populate({ path: "doctor", populate: { path: "user", select: "name email" } });

        res.json({ record: populated });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/records/:id  (admin only)
 */
export const deleteRecord = async (req, res, next) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: "Medical record not found" });
        }

        await record.deleteOne();
        res.json({ message: "Record deleted" });
    } catch (error) {
        next(error);
    }
};
