import HousekeepingTask, { LinenItem, WasteRecord } from "../models/Housekeeping.js";

/**
 * GET /api/housekeeping  (protected)
 * Returns tasks + linen + waste records
 */
export const getHousekeepingData = async (req, res, next) => {
    try {
        const taskFilter = {};
        if (req.query.status) taskFilter.status = req.query.status;

        const [tasks, linenItems, wasteRecords] = await Promise.all([
            HousekeepingTask.find(taskFilter).sort({ createdAt: -1 }),
            LinenItem.find().sort({ itemName: 1 }),
            WasteRecord.find().sort({ createdAt: -1 }).limit(50),
        ]);

        res.json({ tasks, linenItems, wasteRecords });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/housekeeping/tasks  (protected — admin, receptionist)
 */
export const createHousekeepingTask = async (req, res, next) => {
    try {
        const { area, taskType, assignedTo, priority } = req.body;
        if (!area) return res.status(400).json({ message: "Area is required" });

        const task = await HousekeepingTask.create({ area, taskType, assignedTo, priority });
        res.status(201).json({ task });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/housekeeping/tasks/:id  (protected — admin)
 */
export const updateHousekeepingTask = async (req, res, next) => {
    try {
        const task = await HousekeepingTask.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (req.body.status) task.status = req.body.status;
        if (req.body.status === "completed") task.completedAt = new Date();

        await task.save();
        res.json({ task });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/housekeeping/linen  (protected — admin)
 */
export const addLinenItem = async (req, res, next) => {
    try {
        const { itemName, quantity, location } = req.body;
        if (!itemName) return res.status(400).json({ message: "Item name is required" });

        const item = await LinenItem.create({ itemName, quantity, location });
        res.status(201).json({ item });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/housekeeping/linen/:id  (protected — admin)
 */
export const updateLinenItem = async (req, res, next) => {
    try {
        const item = await LinenItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Linen item not found" });

        if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
        if (req.body.status) item.status = req.body.status;
        if (req.body.location) item.location = req.body.location;

        await item.save();
        res.json({ item });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/housekeeping/waste  (protected — admin)
 */
export const addWasteRecord = async (req, res, next) => {
    try {
        const { category, quantityKg, collectedFrom, disposalMethod, notes } = req.body;
        if (!category) return res.status(400).json({ message: "Category is required" });

        const record = await WasteRecord.create({
            category,
            quantityKg,
            collectedFrom,
            disposedAt: new Date(),
            disposalMethod,
            notes,
        });
        res.status(201).json({ record });
    } catch (error) {
        next(error);
    }
};