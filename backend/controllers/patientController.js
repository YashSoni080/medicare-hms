import Patient from "../models/Patient.js";

/**
 * GET /api/patients  (protected — admin, doctor, receptionist)
 * Query: ?search=Riya
 */
export const getPatients = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.search) {
            // We need to look up User names — do a secondary query
            const { default: User } = await import("../models/User.js");
            const users = await User.find({
                role: "patient",
                name: { $regex: req.query.search, $options: "i" },
            }).select("_id");
            filter.user = { $in: users.map((u) => u._id) };
        }

        const patients = await Patient.find(filter)
            .populate("user", "name email phone avatar")
            .sort({ createdAt: -1 });

        res.json({ count: patients.length, patients });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/patients/:id  (protected)
 */
export const getPatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id).populate(
            "user",
            "name email phone avatar"
        );

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // Patients can only see their own record; doctors & admins see anyone
        if (
            req.user.role === "patient" &&
            patient.user._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: "Not authorized to view this patient" });
        }

        res.json({ patient });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/patients/:id  (protected)
 * Patients update own profile; admin / receptionist can update anyone.
 */
export const updatePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        if (
            req.user.role === "patient" &&
            patient.user.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: "Not authorized to update this patient" });
        }

        const allowedFields = [
            "dateOfBirth",
            "gender",
            "bloodGroup",
            "address",
            "emergencyContact",
            "medicalHistory",
            "allergies",
            "insuranceId",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                patient[field] = req.body[field];
            }
        });

        await patient.save();
        const populated = await patient.populate("user", "name email phone avatar");
        res.json({ patient: populated });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/patients/:id  (protected — admin only)
 */
export const deletePatient = async (req, res, next) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        await patient.deleteOne();
        res.json({ message: "Patient removed" });
    } catch (error) {
        next(error);
    }
};
