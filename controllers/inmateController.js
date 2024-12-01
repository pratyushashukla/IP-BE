import Appointment from "../models/appointmentModel.js";
import Inmate from "../models/inmateModel.js";
import Meal from "../models/mealModel.js";
import TaskAssignment from "../models/taskAssignmentModel.js";
import Visitor from "../models/visitorModel.js";

// Declare a default filter variable
const defaultFilter = { isActive: true };

// Create an Inmate
export const createInmate = async (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    contactNumber,
    status,
    sentenceDuration,
  } = req.body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !gender ||
    !status ||
    !sentenceDuration
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newInmate = new Inmate({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      status,
      sentenceDuration,
    });

    await newInmate.save();
    res
      .status(201)
      .json({ message: "Inmate created successfully", inmate: newInmate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get All Inmates
export const getAllInmates = async (req, res) => {
  try {
    const inmates = await Inmate.find(defaultFilter);
    res.status(200).json(inmates);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Inmate By ID
export const getInmateById = async (req, res) => {
  const { id } = req.params;
  const filter = { ...defaultFilter, _id: id };

  try {
    // Fetch all data concurrently using Promise.all
    const [inmate, mealPlan, tasksAssigned, visitors, appointments] =
      await Promise.all([
        Inmate.findById(filter).lean(),
        Meal.findOne({ inmateId: id }).populate("allergyId").lean(),
        TaskAssignment.find({ inmateId: id }).populate("taskId").lean(),
        Visitor.find({ inmateId: id }).lean(),
        Appointment.find({ inmateId: id }).populate("visitorId").lean(),
      ]);

    // Check if inmate exists
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    // Combine all data into a single object
    const result = {
      ...inmate,
      mealPlan,
      tasksAssigned,
      visitors,
      appointments,
    };

    // Send combined result object
    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Inmate
export const updateInmate = async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    contactNumber,
    status,
    sentenceDuration,
  } = req.body;

  try {
    const inmate = await Inmate.findById(id);
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    // Update the fields
    inmate.firstName = firstName || inmate.firstName;
    inmate.lastName = lastName || inmate.lastName;
    inmate.dateOfBirth = dateOfBirth || inmate.dateOfBirth;
    inmate.gender = gender || inmate.gender;
    inmate.contactNumber = contactNumber || inmate.contactNumber;
    inmate.status = status || inmate.status;
    inmate.sentenceDuration = sentenceDuration || inmate.sentenceDuration;

    await inmate.save();
    res.status(200).json({ message: "Inmate updated successfully", inmate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete Inmate (soft delete by setting isActive to false)
export const deleteInmate = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the inmate has associated visitors
    const visitorCount = await Visitor.countDocuments({
      inmateId: id,
      isActive: true,
    });
    const mealCount = await Meal.countDocuments({
      inmateId: id,
      isActive: true,
    });
    const taskAssignmentCount = await TaskAssignment.countDocuments({
      inmateId: id,
      isActive: true,
    });
    const appointmentCount = await Appointment.countDocuments({
      inmateId: id,
      isActive: true,
    });

    if (
      visitorCount > 0 ||
      mealCount > 0 ||
      taskAssignmentCount > 0 ||
      appointmentCount > 0
    ) {
      return res.status(400).json({
        message: `This inmate has references in other modules. Please handle the associated data first (Visitor, Meal, Task Assignment, Appointment).`,
      });
    }

    // Proceed with soft delete of the inmate
    const inmate = await Inmate.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!inmate) {
      return res.status(404).json({ message: "Inmate not found" });
    }

    res.status(200).json({ message: "Inmate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
