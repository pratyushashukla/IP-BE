import Allergy from "../models/allergyModel.js";

// Declare a default filter variable
const defaultFilter = { isActive: true };

// Create Allergy
export const createAllergy = async (req, res) => {
  let { allergyName, description } = req.body;

  // Trim whitespace from the allergy name
  allergyName = allergyName.trim().toLowerCase();

  if (!allergyName) {
    return res.status(400).json({ message: "Allergy name is required" });
  }

  try {
    // Check if an allergy with the same name already exists
    const existingAllergy = await Allergy.findOne({ allergyName });

    if (existingAllergy) {
      return res
        .status(409)
        .json({ message: "Allergy with this name already exists" });
    }

    // If no existing allergy, create a new one
    const allergy = new Allergy({
      allergyName,
      description,
    });
    const createdAllergy = await allergy.save();
    res.status(201).json({
      message: "Allergy created successfully",
      allergy: createdAllergy,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get All Allergies
export const getAllAllergies = async (req, res) => {
  const additionalFilters = req.query; // Capture any extra filters sent from the frontend
  const filters = { ...defaultFilter, ...additionalFilters }
  try {
    const allergies = await Allergy.find(filters);
    res.status(200).json(allergies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get All Allergies with Pagination
export const getAllAllergiesWithPagination = async (req, res) => {
  // Parse pagination parameters with default values
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
  const offset = (page - 1) * limit;

  try {
    // Fetch paginated allergies with dynamic filters
    const allergies = await Allergy.find(defaultFilter).skip(offset).limit(limit);

    // Count total number of allergies matching the filters
    const total = await Allergy.countDocuments(filters);

    // Package the response with pagination info
    const response = {
      total,
      page,
      limit,
      data: allergies,
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Allergy by ID
export const getAllergyById = async (req, res) => {
  const additionalFilters = req.query; // Capture any extra filters sent from the frontend
  const filters = { _id: req.params.id, isActive: true, ...additionalFilters }; // Merge with default filter

  try {
    const allergy = await Allergy.findOne(filters);

    if (!allergy) {
      return res.status(404).json({ message: "Allergy not found" });
    }

    res.status(200).json(allergy);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Update Allergy
export const updateAllergy = async (req, res) => {
  let { allergyName, description } = req.body;

  // Trim whitespace from allergy name if provided
  if (allergyName) {
    allergyName = allergyName.trim().toLowerCase();
  }

  try {
    // Check if an allergy with the same name already exists, excluding the current allergy
    if (allergyName) {
      const existingAllergy = await Allergy.findOne({ allergyName });

      if (existingAllergy && existingAllergy._id.toString() !== req.params.id) {
        return res
          .status(409)
          .json({ message: "Allergy with this name already exists" });
      }
    }

    // update if no duplicate exists
    const updatedAllergy = await Allergy.findByIdAndUpdate(
      req.params.id,
      { allergyName, description },
      { new: true }
    );

    if (!updatedAllergy) {
      return res.status(404).json({ message: "Allergy not found" });
    }

    res.status(200).json({
      message: "Allergy updated successfully",
      allergy: updatedAllergy,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Allergy
export const deleteAllergy = async (req, res) => {
  try {
    const allergy = await Allergy.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!allergy) {
      return res.status(404).json({ message: "Allergy not found" });
    }

    res.status(200).json({ message: "Allergy deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
