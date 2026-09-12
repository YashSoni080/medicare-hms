import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import Encounter from "../models/Encounter.js";
import Invoice from "../models/Invoice.js";
import LabOrder from "../models/LabOrder.js";
import InventoryItem from "../models/Inventory.js";
import { Bed, Admission } from "../models/Ward.js";

/**
 * GET /api/dashboard/stats  (protected)
 * Returns aggregate stats for the dashboard.
 */
export const getStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalPatients,
            totalDoctors,
            todayAppointments,
            pendingAppointments,
            waitingEncounters,
            totalInvoices,
            revenue,
            pendingLabOrders,
            lowStockItems,
            occupiedBeds,
            totalBeds,
            activeAdmissions,
        ] = await Promise.all([
            Patient.countDocuments(),
            Doctor.countDocuments(),
            Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
            Appointment.countDocuments({ status: "pending" }),
            Encounter.countDocuments({ status: "waiting" }),
            Invoice.countDocuments(),
            Invoice.aggregate([
                { $match: { status: "paid" } },
                { $group: { _id: null, total: { $sum: "$netPayable" } } },
            ]),
            LabOrder.countDocuments({ status: { $in: ["ordered", "sample-collected", "processing"] } }),
            InventoryItem.find({ $expr: { $lte: ["$quantity", "$reorderLevel"] } }).countDocuments(),
            Bed.countDocuments({ status: "occupied" }),
            Bed.countDocuments(),
            Admission.countDocuments({ status: "admitted" }),
        ]);

        res.json({
            stats: {
                totalPatients,
                totalDoctors,
                todayAppointments,
                pendingAppointments,
                waitingEncounters,
                totalInvoices,
                revenue: revenue[0]?.total || 0,
                pendingLabOrders,
                lowStockItems,
                occupiedBeds,
                totalBeds,
                bedOccupancy: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
                activeAdmissions,
            },
        });
    } catch (error) {
        next(error);
    }
};