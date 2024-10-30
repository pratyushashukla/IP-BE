import Appointment from "../models/appointmentModel.js";
import User from "../models/userModel.js";
import Visitor from "../models/visitorModel.js";
import Inmate from "../models/inmateModel.js";

// Create an Appointment
export const scheduleAppointment = async (req, res) => {
  try {
    const { visitorId, inmateId, staffId } = req.body;

    // Check if visitor, inmate, and staff exist
    const visitorExists = await Visitor.findById(visitorId);
    if (!visitorExists) {
      return res.status(404).json({ message: "Visitor not found." });
    }

    const inmateExists = await Inmate.findById(inmateId);
    if (!inmateExists) {
      return res.status(404).json({ message: "Inmate not found." });
    }

    const staffExists = await User.findById(staffId);
    if (!staffExists) {
      return res.status(404).json({ message: "Staff not found." });
    }

    // Create a new Visit instance
    const newVisit = new Appointment(req.body);

    // Save the new visit to the database
    const savedVisit = await newVisit.save();
    res.status(201).json(savedVisit);
  } catch (error) {
    res.status(500).json({
      message: "An unexpected error occurred.",
      details: error.message,
    });
  }
};

// Get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const visit = await Appointment.find()
      .populate("visitorId")
      .populate("inmateId")
      .populate("staffId");
    if (!visit) return res.status(404).json({ message: "Visit not found" });
    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an appointment by ID
export const updateAppointment = async (req, res) => {
  try {
    const updatedVisit = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedVisit)
      return res.status(404).json({ message: "Visit not found" });
    res.json(updatedVisit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an appointment by ID
export const deleteAppointment = async (req, res) => {
  try {
    const deletedVisit = await Appointment.findByIdAndDelete(req.params.id);
    if (!deletedVisit)
      return res.status(404).json({ message: "Visit not found" });
    res.json({ message: "Visit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
