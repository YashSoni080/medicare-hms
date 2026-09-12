import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Patient from "../models/Patient.js";
import InsurancePolicy from "../models/Insurance.js";

/**
 * GET /api/invoices  (protected)
 * Role-filtered. Query: ?status=unpaid&patient=ID
 */
export const getInvoices = async (req, res, next) => {
    try {
        const filter = {};

        if (req.user.role === "patient") {
            const patient = await Patient.findOne({ user: req.user._id });
            if (!patient) return res.status(404).json({ message: "Patient profile not found" });
            filter.patient = patient._id;
        }

        if (req.query.status) filter.status = req.query.status;
        if (req.query.patient) filter.patient = req.query.patient;

        const invoices = await Invoice.find(filter)
            .populate({ path: "patient", populate: { path: "user", select: "name" } })
            .sort({ createdAt: -1 });

        res.json({ count: invoices.length, invoices });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/invoices  (protected — billing clerk, receptionist, admin)
 * Body: { patient, encounter?, items: [{description, category, quantity, unitPrice}], discountAmount, taxAmount }
 * Computes totals and splits insurance vs patient payable.
 */
export const createInvoice = async (req, res, next) => {
    try {
        const { patient, encounter, items, discountAmount = 0, taxAmount = 0 } = req.body;
        if (!patient || !items?.length) {
            return res.status(400).json({ message: "Patient and items are required" });
        }

        const totalAmount = items.reduce((sum, i) => sum + (i.quantity || 1) * (i.unitPrice || 0), 0);
        const netPayable = Math.max(0, totalAmount - discountAmount + taxAmount);

        // Insurance split
        let insurancePayable = 0;
        let patientPayable = netPayable;
        const policy = await InsurancePolicy.findOne({ patient });
        if (policy && policy.coverageCap > 0) {
            insurancePayable = Math.min(netPayable, policy.coverageCap);
            patientPayable = netPayable - insurancePayable;
        }

        const invoice = await Invoice.create({
            patient,
            encounter,
            items: items.map((i) => ({
                ...i,
                amount: (i.quantity || 1) * (i.unitPrice || 0),
            })),
            totalAmount,
            discountAmount,
            taxAmount,
            netPayable,
            insurancePayable,
            patientPayable,
        });

        res.status(201).json({ invoice });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/invoices/:id/pay  (protected — billing clerk, receptionist, admin)
 * Body: { paymentMode, amountPaid, transactionReference, isDeposit }
 * Records payment and updates invoice status.
 */
export const payInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });

        const { paymentMode, amountPaid, transactionReference, isDeposit } = req.body;
        if (!paymentMode || !amountPaid) {
            return res.status(400).json({ message: "Payment mode and amount are required" });
        }

        const payment = await Payment.create({
            invoice: invoice._id,
            patient: invoice.patient,
            paymentMode,
            amountPaid,
            transactionReference,
            isDeposit: isDeposit || false,
            receivedBy: req.user._id,
        });

        // Track total paid
        const totalPaid = await Payment.aggregate([
            { $match: { invoice: invoice._id, isDeposit: false } },
            { $group: { _id: null, total: { $sum: "$amountPaid" } } },
        ]);
        const paid = totalPaid[0]?.total || 0;

        if (paid >= invoice.netPayable) invoice.status = "paid";
        else if (paid > 0) invoice.status = "partial";

        await invoice.save();
        res.status(201).json({ payment, invoice });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/invoices/:id  (protected — admin)
 */
export const deleteInvoice = async (req, res, next) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        if (!invoice) return res.status(404).json({ message: "Invoice not found" });
        res.json({ message: "Invoice deleted" });
    } catch (error) {
        next(error);
    }
};