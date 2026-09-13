import mongoose from "mongoose";

const dietPlanSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },
        admission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admission",
        },
        mealType: {
            type: String,
            enum: ["vegetarian", "non-vegetarian", "vegan", "diabetic", "low-salt", "soft", "liquid", "renal", "other"],
            default: "vegetarian",
        },
        breakfast: String,
        lunch: String,
        dinner: String,
        snacks: String,
        dietaryRestrictions: [String],
        nutritionistNotes: {
            type: String,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("DietPlan", dietPlanSchema);