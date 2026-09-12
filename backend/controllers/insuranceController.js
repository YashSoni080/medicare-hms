import InsurancePolicy, { Claim } from "../models/Insurance.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/insurance-policies  (protected)
 * Role-filtered. Query: ?patient=ID
 */
export const getPolicies = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.patient) filter.patient = req.query.patient;

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        }

        const policies = await InsurancePolicy.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 });

        res.json({ count: policies.length, policies });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/insurance-policies  (protected — admin, receptionist)
 * Body: { patient, tpaName, policyNumber, coverageCap, deductible, coPayPercent, exclusions, validFrom, validTo }
 */
export const createPolicy = async (req, res, next) => {
    try {
        const policy = await InsurancePolicy.create(req.body);
        res.status(201).json({ policy });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/claims  (protected)
 * Role-filtered. Query: ?status=approved
 */
export const getClaims = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        }

        const claims = await Claim.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .populate("policy")
            .populate("invoice")
            .sort({ createdAt: -1 });

        res.json({ count: claims.length, claims });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/claims  (protected — admin, receptionist)
 * Body: { patient, policy, invoice, amount, documents }
 */
export const createClaim = async (req, res, next) => {
    try {
        const claim = await Claim.create(req.body);
        res.status(201).json({ claim });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/claims/:id/status  (protected — admin)
 * Body: { status, remarks }
 */
export const updateClaimStatus = async (req, res, next) => {
    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) return res.status(404).json({ message: "Claim not found" });

        claim.status = req.body.status;
        if (req.body.remarks) claim.remarks = req.body.remarks;
        await claim.save();

        res.json({ claim });
    } catch (error) {
        next(error);
    }
};