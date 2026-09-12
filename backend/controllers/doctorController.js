import Doctor from "../models/Doctor.js";

/**
 * GET /api/doctors
 * Public — returns all available doctors with linked user info.
 * Query params: ?specialization=Cardiology&available=true
 */
export const getDoctors = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.specialization) {
            filter.specialization = { $regex: req.query.specialization, $options: "i" };
        }
        if (req.query.available === "true") {
            filter.isAvailable = true;
        }
        if (req.query.department) {
            filter.department = { $regex: req.query.department, $options: "i" };
        }

        const doctors = await Doctor.find(filter)
            .populate("user", "name email phone avatar")
            .sort({ experience: -1 });

        res.json({ count: doctors.length, doctors });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/doctors/:id
 * Public — single doctor profile.
 */
export const getDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate(
            "user",
            "name email phone avatar"
        );

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json({ doctor });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/doctors/:id  (protected — admin or the doctor themselves)
 * Updates the Doctor profile fields.
 */
export const updateDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Only admin or the doctor owner may update
        if (req.user.role !== "admin" && doctor.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this doctor" });
        }

        const allowedFields = [
            "specialization",
            "department",
            "experience",
            "qualifications",
            "consultationFee",
            "bio",
            "availableDays",
            "availableTimeSlots",
            "isAvailable",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                doctor[field] = req.body[field];
            }
        });

        await doctor.save();

        const populated = await doctor.populate("user", "name email phone avatar");
        res.json({ doctor: populated });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/doctors/:id  (protected — admin only)
 */
export const deleteDoctor = async (req, res, next) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        await doctor.deleteOne();
        res.json({ message: "Doctor removed" });
    } catch (error) {
        next(error);
    }
};
