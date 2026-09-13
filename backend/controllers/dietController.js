import DietPlan from "../models/Diet.js";
import Patient from "../models/Patient.js";

/**
 * GET /api/diet  (protected)
 * Query: ?status=active
 */
export const getDietPlans = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        }

        const plans = await DietPlan.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 });

        res.json({ count: plans.length, plans });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/diet  (protected — doctor, admin)
 * Body: { patient, admission, mealType, breakfast, lunch, dinner, snacks, dietaryRestrictions, nutritionistNotes }
 */
export const createDietPlan = async (req, res, next) => {
    try {
        const { patient, admission, mealType, breakfast, lunch, dinner, snacks, dietaryRestrictions, nutritionistNotes } = req.body;
        if (!patient) return res.status(400).json({ message: "Patient is required" });

        const plan = await DietPlan.create({
            patient,
            admission,
            mealType,
            breakfast,
            lunch,
            dinner,
            snacks,
            dietaryRestrictions,
            nutritionistNotes,
        });

        res.status(201).json({ plan });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/diet/:id  (protected — doctor, admin)
 * Body: { status, breakfast, lunch, dinner, snacks, nutritionistNotes }
 */
export const updateDietPlan = async (req, res, next) => {
    try {
        const plan = await DietPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: "Diet plan not found" });

        const allowed = ["status", "breakfast", "lunch", "dinner", "snacks", "nutritionistNotes", "mealType"];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) plan[field] = req.body[field];
        });

        await plan.save();
        res.json({ plan });
    } catch (error) {
        next(error);
    }
};