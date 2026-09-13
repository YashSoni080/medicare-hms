import User from "../models/User.js";
import Staff from "../models/Staff.js";

/**
 * GET /api/users  (protected — admin)
 * Returns all users, optionally excluding those already linked to a staff profile.
 * Query: ?unassigned=true
 */
export const getUsers = async (req, res, next) => {
    try {
        let users = await User.find().select("name email role phone isActive").sort({ name: 1 });

        if (req.query.unassigned === "true") {
            const staffList = await Staff.find().select("user");
            const assignedIds = new Set(staffList.map((s) => String(s.user)));
            users = users.filter((u) => !assignedIds.has(String(u._id)));
        }

        res.json({ count: users.length, users });
    } catch (error) {
        next(error);
    }
};