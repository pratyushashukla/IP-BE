import mongoose from 'mongoose';
import Meal from '../models/mealModel.js';
import Inmate from '../models/inmateModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendMealPlanEmail } from '../utils/emailService.js';
import { generateMealPlanPDF, deleteFile } from '../utils/pdfGenerator.js';

// Set up __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility function to ensure the downloads directory exists
const ensureDownloadsDir = () => {
  const downloadsPath = path.join(__dirname, '../downloads');
  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath, { recursive: true });
  }
};

// Add Meal Plan
export const addMealPlan = async (req, res) => {
  const { inmateId, mealType, mealPlan, allergyId, dietaryPreferences } = req.body;

  // Check if required fields are present
  if (!inmateId || !mealType || !mealPlan) {
    return res.status(400).json({ message: "InmateId, Meal Type and Meal Plan are required" });
  }

  try {
    // Check if a meal plan already exists for this inmate
    const existingMealPlan = await Meal.findOne({ inmateId });

    if (existingMealPlan) {
      return res.status(409).json({ message: "Meal plan already exists for this inmate" });
    }

    // If no existing meal plan, create a new one
    const meal = new Meal({
      inmateId,
      mealType,
      mealPlan,
      allergyId,
      dietaryPreferences,
    });

    const createdMeal = await meal.save();
    res.status(201).json({ message: "Meal plan created successfully", meal: createdMeal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Get All Meal Plans
export const listMeals = async (req, res) => {
  try {
    const meals = await Meal.find().populate("inmateId", "firstName lastName");
    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// List Meal With Pagination
export const listMealsWithPagination = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const meals = await Meal.find()
      .skip(offset)
      .limit(limit)
      .populate("inmateId", "firstName lastName");

    const total = await Meal.countDocuments();

    const response = {
      total,
      page,
      limit,
      data: meals,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Meal Plan by ID
export const getMealById = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate("inmateId", "firstName lastName");

    if (!meal) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.status(200).json(meal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Meal Plan
export const updateMealPlan = async (req, res) => {
  const { mealType, mealPlan, dietaryPreferences, allergyId } = req.body;

  try {
    const updateData = {};

    if (mealType) updateData.mealType = mealType;
    if (mealPlan) updateData.mealPlan = mealPlan;
    if (dietaryPreferences) updateData.dietaryPreferences = dietaryPreferences;
    if (Array.isArray(allergyId)) updateData.allergyId = allergyId; // Ensure allergyId is an array

    const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedMeal) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.status(200).json({ message: "Meal plan updated successfully", meal: updatedMeal });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Delete Meal Plan
export const deleteMealPlan = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    res.status(200).json({ message: "Meal plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Search Meal Plans
export const searchMeals = async (req, res) => {
  const { inmateName, mealType, mealPlan } = req.query;
  const filter = {};

  if (mealType) filter.mealType = mealType;
  if (mealPlan) filter.mealPlan = mealPlan;

  try {
    let inmateIds = [];
    if (inmateName) {
      const inmates = await Inmate.find({
        $or: [
          { firstName: new RegExp(inmateName.trim(), "i") },
          { lastName: new RegExp(inmateName.trim(), "i") },
        ],
      });
      inmateIds = inmates.map(inmate => inmate._id);
    }

    if (inmateIds.length > 0) {
      filter.inmateId = { $in: inmateIds };
    } else if (inmateName) {
      return res.status(200).json([]);
    }

    const meals = await Meal.find(filter).populate("inmateId", "firstName lastName");
    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Search with Pagination
export const searchMealsWithPagination = async (req, res) => {
  const { inmateName, mealType, mealPlan, page = 1, limit = 10 } = req.query;
  const filter = {};
  const offset = (parseInt(page) - 1) * parseInt(limit);

  if (mealType) filter.mealType = mealType;
  if (mealPlan) filter.mealPlan = mealPlan;

  try {
    let inmateIds = [];
    if (inmateName) {
      const inmates = await Inmate.find({
        $or: [
          { firstName: new RegExp(inmateName.trim(), "i") },
          { lastName: new RegExp(inmateName.trim(), "i") },
        ],
      });
      inmateIds = inmates.map(inmate => inmate._id);
    }

    if (inmateIds.length > 0) {
      filter.inmateId = { $in: inmateIds };
    } else if (inmateName) {
      return res.status(200).json([]);
    }

    const meals = await Meal.find(filter)
      .skip(offset)
      .limit(parseInt(limit))
      .populate("inmateId", "firstName lastName");

    const total = await Meal.countDocuments(filter);

    const response = {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: meals,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Download Meal Plan as PDF
export const downloadMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate("inmateId", "firstName lastName");

    if (!meal) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    ensureDownloadsDir();

    const inmateName = `${meal.inmateId.firstName}_${meal.inmateId.lastName}`;
    const fileName = inmateName + "_meal_info";
    const pdfPath = path.join(__dirname, `../downloads/${fileName}.pdf`);
    
    await generateMealPlanPDF(meal, pdfPath);

    res.download(pdfPath, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ message: "Error downloading file" });
      } else {
        deleteFile(pdfPath);
      }
    });
  } catch (error) {
    console.error("Error in downloadMeal:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Email Meal Plan PDF
export const emailMealPlan = async (req, res) => {
  const { email } = req.body;
  let pdfPath;
  
  try {
    const meal = await Meal.findById(req.params.id)
      .populate("inmateId", "firstName lastName")
      .populate("allergyId", "allergyName description"); 

    if (!meal) {
      return res.status(404).json({ message: "Meal plan not found" });
    }

    ensureDownloadsDir();

    pdfPath = path.join(__dirname, `../downloads/meal_${meal._id}.pdf`);
    await generateMealPlanPDF(meal, pdfPath);

    // Format allergy information
    const allergies = meal.allergyId
      .map(allergy => `${allergy.allergyName}${allergy.description ? `: ${allergy.description}` : ''}`)
      .join(", ") || 'None';

    await sendMealPlanEmail(
      email,
      `${meal.inmateId.firstName} ${meal.inmateId.lastName}`,
      `Meal Type: ${meal.mealType}\nMeal Plan: ${meal.mealPlan}\nDietary Preferences: ${meal.dietaryPreferences || 'None'}\nAllergies: ${allergies}`,
      pdfPath
    );

    res.status(200).json({ message: "Meal plan emailed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

