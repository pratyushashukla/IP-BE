import Allergy from "../models/allergyModel.js";

// Create Allergy
export const createAllergy = async (req, res) => {
  const { allergyName, description } = req.body;

  if (!allergyName) {
    return res.status(400).json({ message: "Allergy name is required" });
  }

  try {
    const allergy = new Allergy({
      allergyName,
      description,
    });
    const createdAllergy = await allergy.save();
    res.status(201).json({ message: "Allergy created successfully", allergy: createdAllergy });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get All Allergies
export const getAllAllergies = async (req, res) => {
  try {
    const allergies = await Allergy.find();
    res.status(200).json(allergies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get All Allergies with pagination
export const getAllAllergiesWithPagination = async (req, res) => {
    // Parse pagination parameters with default values
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const offset = (page - 1) * limit;
  
    try {
      // Fetch paginated allergies from the database
      const allergies = await Allergy.find().skip(offset).limit(limit);
  
      // Count total number of allergies for pagination
      const total = await Allergy.countDocuments();
  
      // Package the response with pagination info
      const response = {
        total,
        page,
        limit,
        data: allergies,
      };
  
      // Send the response
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  

// Get Allergy by ID
export const getAllergyById = async (req, res) => {
  try {
    const allergy = await Allergy.findById(req.params.id);

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
  const { allergyName, description } = req.body;

  try {
    const updatedAllergy = await Allergy.findByIdAndUpdate(
      req.params.id,
      { allergyName, description },
      { new: true }
    );

    if (!updatedAllergy) {
      return res.status(404).json({ message: "Allergy not found" });
    }

    res.status(200).json({ message: "Allergy updated successfully", allergy: updatedAllergy });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Allergy
export const deleteAllergy = async (req, res) => {
  try {
    const allergy = await Allergy.findByIdAndDelete(req.params.id);

    if (!allergy) {
      return res.status(404).json({ message: "Allergy not found" });
    }

    res.status(200).json({ message: "Allergy deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
