import Appointment from "../models/appointmentModel.js";
import User from "../models/userModel.js";
import Visitor from "../models/visitorModel.js";
import Inmate from "../models/inmateModel.js";
import mongoose from "mongoose";

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
  if ("visitorId" in req.body && req.body.visitorId) {
    req.body.visitorId = new mongoose.Types.ObjectId(req.body.visitorId);
  }

  try {
    const updatedVisit = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedVisit)
      return res.status(404).json({ message: "Visit not found" });
    res
      .status(200)
      .json({ result: updatedVisit, message: "Appointment Updated" });
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

// Search Appointments by Filter Parameters
export const searchAppointments = async (req, res) => {
  const { name, inmateName, status } = req.query;

  const filter = {};

  try {
    // Filter by Visitor Name if provided
    if (name) {
      const visitors = await Visitor.find({
        $or: [
          { firstname: new RegExp(name.trim(), "i") },
          { lastname: new RegExp(name.trim(), "i") },
        ],
      });
      const visitorIds = visitors.map((visitor) => visitor._id);
      
      if (visitorIds.length > 0) {
        filter.visitorId = { $in: visitorIds };
      } else {
        // If name is provided but no visitors found, return empty result
        return res.status(200).json([]);
      }
    }

    // Filter by Inmate Name if provided
    if (inmateName) {
      const inmates = await Inmate.find({
        $or: [
          { firstName: new RegExp(inmateName.trim(), "i") },
          { lastName: new RegExp(inmateName.trim(), "i") },
        ],
      });
      const inmateIds = inmates.map((inmate) => inmate._id);

      if (inmateIds.length > 0) {
        filter.inmateId = { $in: inmateIds };
      } else {
        // If inmateName is provided but no inmates found, return empty result
        return res.status(200).json([]);
      }
    }

    // Filter by Status if provided
    if (status) {
      filter.status = new RegExp(status.trim(), "i");
    }

    // Query appointments with the accumulated filter and populate visitor and inmate details
    const visits = await Appointment.find(filter)
      .populate("visitorId")
      .populate("inmateId")
      .populate("staffId");

    res.status(200).json(visits);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
