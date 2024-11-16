import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    inmateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inmate",
      required: true,
    },
    mealType: {
      type: String,
      required: true,
      enum: ["Vegetarian", "Vegan", "None", "Non-Veg", "Halal"], // can add or remove dietary options accordingly
    },
    mealPlan: {
      type: String,
      required: true,
      enum: ["Weekly", "Monthly"],
    },
    allergyId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Allergy",
      }
    ],
    dietaryPreferences: {
      type: String, // Text box input for user notes
    },
    isActive: {
      type: Boolean,
      default: true, // Defaults to true, will be set to false on delete
    },
  },
  {
    timestamps: true,
  }
);

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;
