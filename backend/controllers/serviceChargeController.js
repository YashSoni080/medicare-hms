import ServiceCharge from "../models/ServiceCharge.js";

/**
 * GET /api/service-charges  (protected)
 * Query: ?category=consultation&isActive=true
 */
export const getServiceCharges = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";

        const charges = await ServiceCharge.find(filter).sort({ category: 1, name: 1 });
        res.json({ count: charges.length, charges });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/service-charges  (protected — admin)
 * Body: { name, category, charge, description }
 */
export const createServiceCharge = async (req, res, next) => {
    try {
        const { name, category, charge, description } = req.body;
        if (!name || charge === undefined) {
            return res.status(400).json({ message: "Name and charge are required" });
        }

        const serviceCharge = await ServiceCharge.create({ name, category, charge, description });
        res.status(201).json({ serviceCharge });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/service-charges/:id  (protected — admin)
 * Body: { name, category, charge, description, isActive }
 */
export const updateServiceCharge = async (req, res, next) => {
    try {
        const serviceCharge = await ServiceCharge.findById(req.params.id);
        if (!serviceCharge) return res.status(404).json({ message: "Service charge not found" });

        const allowed = ["name", "category", "charge", "description", "isActive"];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) serviceCharge[field] = req.body[field];
        });

        await serviceCharge.save();
        res.json({ serviceCharge });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/service-charges/:id  (protected — admin)
 */
export const deleteServiceCharge = async (req, res, next) => {
    try {
        const serviceCharge = await ServiceCharge.findById(req.params.id);
        if (!serviceCharge) return res.status(404).json({ message: "Service charge not found" });

        await serviceCharge.deleteOne();
        res.json({ message: "Service charge deleted" });
    } catch (error) {
        next(error);
    }
};