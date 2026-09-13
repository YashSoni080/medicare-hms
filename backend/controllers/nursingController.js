import NursingTask, { VitalRecord } from "../models/Nursing.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/nursing  (protected)
 * Returns nursing tasks + vital records. Query: ?status=pending
 */
export const getNursingData = async (req, res, next) => {
    try {
        const taskFilter = {};
        if (req.query.status) taskFilter.status = req.query.status;

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            taskFilter.patient = patient._id;
        }

        const [tasks, vitals] = await Promise.all([
            NursingTask.find(taskFilter)
                .populate({ path: "patient", populate: { path: "user", select: "name" } })
                .sort({ createdAt: -1 }),
            VitalRecord.find(taskFilter.patient ? { patient: taskFilter.patient } : {})
                .populate({ path: "patient", populate: { path: "user", select: "name" } })
                .sort({ createdAt: -1 })
                .limit(50),
        ]);

        res.json({ tasks, vitals });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/nursing/tasks  (protected — nurse, doctor, admin)
 * Body: { patient, admission, taskType, description, scheduledTime, assignedTo }
 */
export const createNursingTask = async (req, res, next) => {
    try {
        const { patient, admission, taskType, description, scheduledTime, assignedTo } = req.body;
        if (!patient || !taskType) {
            return res.status(400).json({ message: "Patient and task type are required" });
        }

        const task = await NursingTask.create({
            patient,
            admission,
            taskType,
            description,
            scheduledTime,
            assignedTo,
        });

        res.status(201).json({ task });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/nursing/tasks/:id  (protected — nurse, doctor, admin)
 * Body: { status, notes }
 */
export const updateNursingTask = async (req, res, next) => {
    try {
        const task = await NursingTask.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Nursing task not found" });

        if (req.body.status) task.status = req.body.status;
        if (req.body.notes) task.notes = req.body.notes;
        if (req.body.status === "completed") task.completedTime = new Date();

        await task.save();
        res.json({ task });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/nursing/vitals  (protected — nurse, doctor, admin)
 * Body: { patient, bpSystolic, bpDiastolic, pulse, temperature, spo2, respiratoryRate, weight, notes }
 */
export const recordVitals = async (req, res, next) => {
    try {
        const { patient, bpSystolic, bpDiastolic, pulse, temperature, spo2, respiratoryRate, weight, notes } = req.body;
        if (!patient) return res.status(400).json({ message: "Patient is required" });

        const vital = await VitalRecord.create({
            patient,
            bpSystolic,
            bpDiastolic,
            pulse,
            temperature,
            spo2,
            respiratoryRate,
            weight,
            recordedBy: req.user._id,
            notes,
        });

        res.status(201).json({ vital });
    } catch (error) {
        next(error);
    }
};