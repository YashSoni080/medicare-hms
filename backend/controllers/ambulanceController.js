import Ambulance, { AmbulanceTrip } from "../models/Ambulance.js";

/**
 * GET /api/ambulance  (protected)
 * Returns ambulances + trips
 */
export const getAmbulanceData = async (req, res, next) => {
    try {
        const [ambulances, trips] = await Promise.all([
            Ambulance.find().sort({ vehicleNumber: 1 }),
            AmbulanceTrip.find()
                .populate({ path: "patient", populate: { path: "user", select: "name" } })
                .populate("ambulance", "vehicleNumber type")
                .sort({ createdAt: -1 })
                .limit(50),
        ]);

        res.json({ ambulances, trips });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/ambulance  (protected — admin)
 * Body: { vehicleNumber, type, driverName, driverPhone }
 */
export const createAmbulance = async (req, res, next) => {
    try {
        const { vehicleNumber, type, driverName, driverPhone } = req.body;
        if (!vehicleNumber) return res.status(400).json({ message: "Vehicle number is required" });

        const ambulance = await Ambulance.create({ vehicleNumber, type, driverName, driverPhone });
        res.status(201).json({ ambulance });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/ambulance/:id  (protected — admin)
 * Body: { status, driverName, driverPhone }
 */
export const updateAmbulance = async (req, res, next) => {
    try {
        const ambulance = await Ambulance.findById(req.params.id);
        if (!ambulance) return res.status(404).json({ message: "Ambulance not found" });

        if (req.body.status) ambulance.status = req.body.status;
        if (req.body.driverName) ambulance.driverName = req.body.driverName;
        if (req.body.driverPhone) ambulance.driverPhone = req.body.driverPhone;

        await ambulance.save();
        res.json({ ambulance });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/ambulance/trips  (protected — receptionist, admin)
 * Body: { ambulance, patient, pickupLocation, dropLocation }
 */
export const createTrip = async (req, res, next) => {
    try {
        const { ambulance, patient, pickupLocation, dropLocation } = req.body;
        if (!ambulance || !pickupLocation || !dropLocation) {
            return res.status(400).json({ message: "Ambulance, pickup and drop locations are required" });
        }

        const trip = await AmbulanceTrip.create({
            ambulance,
            patient,
            pickupLocation,
            dropLocation,
            startTime: new Date(),
        });

        // Mark ambulance as on-trip
        await Ambulance.findByIdAndUpdate(ambulance, { status: "on-trip" });

        res.status(201).json({ trip });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/ambulance/trips/:id  (protected — receptionist, admin)
 * Body: { status, notes }
 */
export const updateTrip = async (req, res, next) => {
    try {
        const trip = await AmbulanceTrip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        if (req.body.status) trip.status = req.body.status;
        if (req.body.notes) trip.notes = req.body.notes;

        if (req.body.status === "completed") {
            trip.endTime = new Date();
            await Ambulance.findByIdAndUpdate(trip.ambulance, { status: "available" });
        }

        await trip.save();
        res.json({ trip });
    } catch (error) {
        next(error);
    }
};