import BloodUnit, { BloodRequest } from "../models/BloodBank.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/blood-bank  (protected)
 * Returns blood units + requests. Query: ?status=available
 */
export const getBloodBank = async (req, res, next) => {
    try {
        const unitFilter = {};
        if (req.query.status) unitFilter.status = req.query.status;

        const [units, requests] = await Promise.all([
            BloodUnit.find(unitFilter).sort({ createdAt: -1 }),
            BloodRequest.find()
                .populate({ path: "patient", populate: { path: "user", select: "name" } })
                .sort({ createdAt: -1 }),
        ]);

        res.json({ units, requests });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/blood-bank/units  (protected — admin, lab-tech)
 * Body: { bloodGroup, component, donorName, donorId, collectionDate, expiryDate }
 */
export const addBloodUnit = async (req, res, next) => {
    try {
        const { bloodGroup, component, donorName, donorId, collectionDate, expiryDate } = req.body;
        if (!bloodGroup) return res.status(400).json({ message: "Blood group is required" });

        const unit = await BloodUnit.create({
            bloodGroup,
            component,
            donorName,
            donorId,
            collectionDate,
            expiryDate,
        });

        res.status(201).json({ unit });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/blood-bank/requests  (protected — doctor, admin)
 * Body: { patient, bloodGroup, units, reason }
 */
export const createBloodRequest = async (req, res, next) => {
    try {
        const { patient, bloodGroup, units, reason } = req.body;
        if (!patient || !bloodGroup) {
            return res.status(400).json({ message: "Patient and blood group are required" });
        }

        const request = await BloodRequest.create({
            patient,
            bloodGroup,
            units: units || 1,
            reason,
            requestedBy: req.user._id,
        });

        res.status(201).json({ request });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/blood-bank/requests/:id  (protected — admin, lab-tech)
 * Body: { status }
 * When status=issued → marks matching available units as issued
 */
export const updateBloodRequest = async (req, res, next) => {
    try {
        const request = await BloodRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Blood request not found" });

        request.status = req.body.status || request.status;
        await request.save();

        if (request.status === "issued") {
            const units = await BloodUnit.find({ bloodGroup: request.bloodGroup, status: "available" })
                .limit(request.units);
            for (const unit of units) {
                unit.status = "issued";
                unit.issuedTo = request.patient;
                await unit.save();
            }
        }

        res.json({ request });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/blood-bank/units/:id/status  (protected — admin, lab-tech)
 * Body: { status }
 */
export const updateBloodUnitStatus = async (req, res, next) => {
    try {
        const unit = await BloodUnit.findById(req.params.id);
        if (!unit) return res.status(404).json({ message: "Blood unit not found" });

        unit.status = req.body.status || unit.status;
        await unit.save();
        res.json({ unit });
    } catch (error) {
        next(error);
    }
};