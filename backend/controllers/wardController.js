import Ward, { Bed, Admission } from "../models/Ward.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/wards  (protected)
 * Returns wards with their beds and bed matrix counts.
 */
export const getWards = async (req, res, next) => {
    try {
        const wards = await Ward.find().sort({ name: 1 });
        const beds = await Bed.find().populate("ward", "name category");

        const result = wards.map((ward) => {
            const wardBeds = beds.filter((b) => b.ward._id.toString() === ward._id.toString());
            return {
                ...ward.toObject(),
                beds: wardBeds,
                stats: {
                    total: wardBeds.length,
                    available: wardBeds.filter((b) => b.status === "available").length,
                    occupied: wardBeds.filter((b) => b.status === "occupied").length,
                    cleaning: wardBeds.filter((b) => b.status === "cleaning").length,
                },
            };
        });

        res.json({ count: result.length, wards: result });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/wards  (protected — admin)
 * Body: { name, category, floor, tariffPerDay, bedCount }
 * Creates a ward and its beds.
 */
export const createWard = async (req, res, next) => {
    try {
        const { name, category, floor, tariffPerDay, bedCount = 1 } = req.body;
        if (!name || !category) return res.status(400).json({ message: "Name and category are required" });

        const ward = await Ward.create({ name, category, floor, tariffPerDay });

        const beds = [];
        for (let i = 1; i <= bedCount; i++) {
            beds.push({ ward: ward._id, bedNumber: `${name.split(" ")[0]}-${String(i).padStart(3, "0")}` });
        }
        await Bed.insertMany(beds);

        res.status(201).json({ ward, beds });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admissions  (protected — doctor, receptionist, admin)
 * Body: { patient, bed, depositAmount, reason }
 * Allocates a bed and creates an admission.
 */
export const createAdmission = async (req, res, next) => {
    try {
        const { patient, bed, depositAmount, reason } = req.body;
        if (!patient || !bed) return res.status(400).json({ message: "Patient and bed are required" });

        const bedDoc = await Bed.findById(bed);
        if (!bedDoc) return res.status(404).json({ message: "Bed not found" });
        if (bedDoc.status !== "available") {
            return res.status(409).json({ message: "Bed is not available" });
        }

        const admission = await Admission.create({
            patient,
            bed,
            admittedBy: req.user._id,
            depositAmount: depositAmount || 0,
            reason,
        });

        bedDoc.status = "occupied";
        bedDoc.currentPatient = patient;
        await bedDoc.save();

        res.status(201).json({ admission });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admissions  (protected)
 * Role-filtered. Query: ?status=admitted
 */
export const getAdmissions = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        }

        const admissions = await Admission.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate({ path: "bed", populate: { path: "ward", select: "name category" } })
            .sort({ createdAt: -1 });

        res.json({ count: admissions.length, admissions });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admissions/:id/discharge  (protected — doctor, admin)
 * Body: { dischargeSummary }
 * Releases the bed and marks admission discharged.
 */
export const dischargePatient = async (req, res, next) => {
    try {
        const admission = await Admission.findById(req.params.id);
        if (!admission) return res.status(404).json({ message: "Admission not found" });

        admission.status = "discharged";
        admission.dischargeDate = new Date();
        admission.dischargeSummary = req.body.dischargeSummary || "";
        await admission.save();

        const bed = await Bed.findById(admission.bed);
        if (bed) {
            bed.status = "cleaning";
            bed.currentPatient = null;
            await bed.save();
        }

        res.json({ admission });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/beds/:id/status  (protected — admin, housekeeping)
 * Body: { status }
 */
export const updateBedStatus = async (req, res, next) => {
    try {
        const bed = await Bed.findById(req.params.id);
        if (!bed) return res.status(404).json({ message: "Bed not found" });

        bed.status = req.body.status;
        if (req.body.status === "available") bed.currentPatient = null;
        await bed.save();

        res.json({ bed });
    } catch (error) {
        next(error);
    }
};