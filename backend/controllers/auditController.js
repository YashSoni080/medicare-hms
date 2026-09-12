import AuditLog from "../models/AuditLog.js";

/**
 * GET /api/audit-logs  (protected — admin only)
 * Query: ?action=CREATE&entityName=Patient&userId=ID&limit=50
 */
export const getAuditLogs = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.action) filter.action = req.query.action;
        if (req.query.entityName) filter.entityName = req.query.entityName;
        if (req.query.userId) filter.user = req.query.userId;

        const limit = parseInt(req.query.limit) || 50;

        const logs = await AuditLog.find(filter)
            .populate("user", "name email role")
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({ count: logs.length, logs });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/audit-logs  (protected)
 * Body: { action, entityName, entityId, oldValues, newValues }
 * Used by other controllers to record actions.
 */
export const createAuditLog = async (req, res, next) => {
    try {
        const log = await AuditLog.create({
            user: req.user._id,
            action: req.body.action,
            entityName: req.body.entityName,
            entityId: req.body.entityId,
            oldValues: req.body.oldValues,
            newValues: req.body.newValues,
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
        res.status(201).json({ log });
    } catch (error) {
        next(error);
    }
};