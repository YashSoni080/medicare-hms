import Staff, { Attendance } from "../models/Staff.js";

/**
 * GET /api/staff  (protected)
 * Returns staff list + attendance. Query: ?department=X
 */
export const getStaff = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.department) filter.department = req.query.department;

        const staffList = await Staff.find(filter)
            .populate("user", "name email phone role")
            .sort({ employeeId: 1 });

        res.json({ count: staffList.length, staff: staffList });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/staff  (protected — admin)
 * Body: { user, department, designation, joiningDate, salary, shift, emergencyContact, address }
 */
export const createStaff = async (req, res, next) => {
    try {
        const { user, department, designation, joiningDate, salary, shift, emergencyContact, address } = req.body;
        if (!user || !department || !designation) {
            return res.status(400).json({ message: "User, department and designation are required" });
        }

        const staff = await Staff.create({
            user,
            department,
            designation,
            joiningDate,
            salary,
            shift,
            emergencyContact,
            address,
        });

        res.status(201).json({ staff });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/staff/:id  (protected — admin)
 * Body: { department, designation, salary, shift }
 */
export const updateStaff = async (req, res, next) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) return res.status(404).json({ message: "Staff not found" });

        const allowed = ["department", "designation", "salary", "shift", "emergencyContact", "address"];
        allowed.forEach((field) => {
            if (req.body[field] !== undefined) staff[field] = req.body[field];
        });

        await staff.save();
        res.json({ staff });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/staff/attendance  (protected — admin)
 * Body: { staff, date, checkIn, checkOut, status, notes }
 */
export const recordAttendance = async (req, res, next) => {
    try {
        const { staff, date, checkIn, checkOut, status, notes } = req.body;
        if (!staff || !date) {
            return res.status(400).json({ message: "Staff and date are required" });
        }

        const record = await Attendance.create({ staff, date, checkIn, checkOut, status, notes });
        res.status(201).json({ record });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/staff/attendance  (protected)
 * Query: ?staff=<id>&date=2025-01-15
 */
export const getAttendance = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.staff) filter.staff = req.query.staff;
        if (req.query.date) {
            const d = new Date(req.query.date);
            const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
            filter.date = { $gte: start, $lt: end };
        }

        const records = await Attendance.find(filter)
            .populate({ path: "staff", populate: { path: "user", select: "name" } })
            .sort({ date: -1 });

        res.json({ count: records.length, records });
    } catch (error) {
        next(error);
    }
};