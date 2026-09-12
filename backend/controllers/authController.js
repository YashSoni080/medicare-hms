import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

// Helper to generate JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * POST /api/auth/register
 * Body: { name, email, password, role?, phone? }
 * When role=patient → auto-creates a Patient document
 * When role=doctor  → auto-creates a Doctor document (admin must fill profile later)
 */
export const register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const user = await User.create({ name, email, password, role, phone });

        // Auto-create linked profile document
        if (user.role === "patient") {
            const { patient } = req.body;
            await Patient.create({
                user: user._id,
                gender: patient?.gender?.toLowerCase(),
                dateOfBirth: patient?.dob || patient?.dateOfBirth,
                bloodGroup: patient?.bloodGroup,
                address: patient?.address,
                idProof: patient?.idProof,
            });
        } else if (user.role === "doctor") {
            const { doctor } = req.body;
            await Doctor.create({
                user: user._id,
                specialization: doctor?.specialization || "General",
                department: doctor?.department,
                experience: doctor?.experience,
                consultationFee: doctor?.consultationFee,
                bio: doctor?.bio,
            });
        }

        res.status(201).json({
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account has been deactivated" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me  (protected)
 * Returns the currently authenticated user with linked profile.
 */
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        let profile = null;
        if (user.role === "patient") {
            profile = await Patient.findOne({ user: user._id });
        } else if (user.role === "doctor") {
            profile = await Doctor.findOne({ user: user._id }).populate("user", "name email phone");
        }

        res.json({ user, profile });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/auth/update-profile  (protected)
 * Updates name, phone on the User document.
 */
export const updateProfile = async (req, res, next) => {
    try {
        const allowed = {};
        if (req.body.name) allowed.name = req.body.name;
        if (req.body.phone !== undefined) allowed.phone = req.body.phone;

        const user = await User.findByIdAndUpdate(req.user._id, allowed, {
            new: true,
            runValidators: true,
        }).select("-password");

        res.json({ user });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/auth/change-password  (protected)
 * Body: { currentPassword, newPassword }
 */
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current and new password are required" });
        }

        const user = await User.findById(req.user._id).select("+password");
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        user.password = newPassword;
        await user.save(); // triggers the pre-save hook

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        next(error);
    }
};
