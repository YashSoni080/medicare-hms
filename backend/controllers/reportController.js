import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Encounter from "../models/Encounter.js";
import Invoice from "../models/Invoice.js";
import LabOrder from "../models/LabOrder.js";
import Inventory from "../models/Inventory.js";
import Admission from "../models/Ward.js";
import EmergencyCase from "../models/Emergency.js";
import OperationTheatre from "../models/OperationTheatre.js";
import BloodUnit from "../models/BloodBank.js";
import RadiologyOrder from "../models/Radiology.js";
import Teleconsultation from "../models/Telemedicine.js";
import DietPlan from "../models/Diet.js";
import NursingTask from "../models/Nursing.js";
import HousekeepingTask from "../models/Housekeeping.js";
import AmbulanceTrip from "../models/Ambulance.js";
import Staff from "../models/Staff.js";
import ServiceCharge from "../models/ServiceCharge.js";

const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const startOfMonth = () => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * GET /api/reports/overview  (protected — admin)
 * High-level operational KPIs across all modules
 */
export const getOverviewReport = async (req, res, next) => {
    try {
        const today = startOfToday();
        const monthStart = startOfMonth();

        const [
            totalPatients,
            newPatientsToday,
            totalAppointments,
            todayAppointments,
            totalEncounters,
            todayEncounters,
            totalInvoices,
            monthRevenue,
            pendingLabOrders,
            activeAdmissions,
            emergencyCases,
            scheduledSurgeries,
            bloodUnitsAvailable,
            radiologyPending,
            teleconsultations,
            activeDietPlans,
            pendingNursingTasks,
            pendingHousekeeping,
            activeTrips,
            totalStaff,
            serviceCharges,
        ] = await Promise.all([
            Patient.countDocuments(),
            Patient.countDocuments({ createdAt: { $gte: today } }),
            Appointment.countDocuments(),
            Appointment.countDocuments({ date: { $gte: today } }),
            Encounter.countDocuments(),
            Encounter.countDocuments({ createdAt: { $gte: today } }),
            Invoice.countDocuments(),
            Invoice.aggregate([
                { $match: { status: { $in: ["paid", "partial"] }, createdAt: { $gte: monthStart } } },
                { $group: { _id: null, total: { $sum: "$netPayable" } } },
            ]),
            LabOrder.countDocuments({ status: { $in: ["ordered", "in-progress"] } }),
            Admission.countDocuments({ status: { $in: ["active", "admitted"] } }),
            EmergencyCase.countDocuments({ status: { $in: ["triage", "in-treatment"] } }),
            OperationTheatre.countDocuments({ status: "scheduled" }),
            BloodUnit.countDocuments({ status: "available" }),
            RadiologyOrder.countDocuments({ status: { $in: ["ordered", "scheduled", "in-progress"] } }),
            Teleconsultation.countDocuments({ status: { $in: ["scheduled", "in-progress"] } }),
            DietPlan.countDocuments({ status: "active" }),
            NursingTask.countDocuments({ status: { $in: ["pending", "in-progress"] } }),
            HousekeepingTask.countDocuments({ status: { $in: ["pending", "in-progress"] } }),
            AmbulanceTrip.countDocuments({ status: { $in: ["dispatched", "on-scene", "transporting"] } }),
            Staff.countDocuments(),
            ServiceCharge.countDocuments({ isActive: true }),
        ]);

        res.json({
            report: {
                patients: { total: totalPatients, newToday: newPatientsToday },
                appointments: { total: totalAppointments, today: todayAppointments },
                encounters: { total: totalEncounters, today: todayEncounters },
                billing: { totalInvoices, monthRevenue: monthRevenue[0]?.total || 0 },
                lab: { pendingOrders: pendingLabOrders },
                wards: { activeAdmissions },
                emergency: { activeCases: emergencyCases },
                ot: { scheduledSurgeries },
                bloodBank: { availableUnits: bloodUnitsAvailable },
                radiology: { pendingOrders: radiologyPending },
                telemedicine: { upcoming: teleconsultations },
                diet: { activePlans: activeDietPlans },
                nursing: { pendingTasks: pendingNursingTasks },
                housekeeping: { pendingTasks: pendingHousekeeping },
                ambulance: { activeTrips },
                staff: { total: totalStaff },
                serviceCharges: { active: serviceCharges },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reports/revenue  (protected — admin)
 * Monthly revenue breakdown by invoice status
 */
export const getRevenueReport = async (req, res, next) => {
    try {
        const monthStart = startOfMonth();

        const [byStatus, monthly] = await Promise.all([
            Invoice.aggregate([
                { $match: { createdAt: { $gte: monthStart } } },
                { $group: { _id: "$status", total: { $sum: "$netPayable" }, count: { $sum: 1 } } },
            ]),
            Invoice.aggregate([
                { $match: { status: { $in: ["paid", "partial"] } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        total: { $sum: "$netPayable" },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        res.json({ report: { byStatus, monthly } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reports/clinical  (protected — admin)
 * Clinical activity: encounters by type, lab orders by status, radiology by modality
 */
export const getClinicalReport = async (req, res, next) => {
    try {
        const monthStart = startOfMonth();

        const [encountersByType, labByStatus, radiologyByModality, emergencyByTriage] = await Promise.all([
            Encounter.aggregate([
                { $match: { createdAt: { $gte: monthStart } } },
                { $group: { _id: "$visitType", count: { $sum: 1 } } },
            ]),
            LabOrder.aggregate([
                { $match: { createdAt: { $gte: monthStart } } },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            RadiologyOrder.aggregate([
                { $match: { createdAt: { $gte: monthStart } } },
                { $group: { _id: "$modality", count: { $sum: 1 } } },
            ]),
            EmergencyCase.aggregate([
                { $match: { createdAt: { $gte: monthStart } } },
                { $group: { _id: "$triageLevel", count: { $sum: 1 } } },
            ]),
        ]);

        res.json({ report: { encountersByType, labByStatus, radiologyByModality, emergencyByTriage } });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reports/operations  (protected — admin)
 * Operations: bed occupancy, inventory low stock, nursing/housekeeping workload
 */
export const getOperationsReport = async (req, res, next) => {
    try {
        const [bedStats, lowStock, nursingByStatus, housekeepingByStatus, bloodByGroup] = await Promise.all([
            Admission.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Inventory.find({ quantity: { $lte: 10 } }).select("name quantity reorderLevel").sort({ quantity: 1 }),
            NursingTask.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            HousekeepingTask.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            BloodUnit.aggregate([{ $group: { _id: "$bloodGroup", count: { $sum: 1 } } }]),
        ]);

        res.json({ report: { bedStats, lowStock, nursingByStatus, housekeepingByStatus, bloodByGroup } });
    } catch (error) {
        next(error);
    }
};