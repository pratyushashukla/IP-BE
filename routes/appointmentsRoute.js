import express from "express";
import {
  scheduleAppointment,
  getAllAppointments,
  updateAppointment,
  deleteAppointment,
  searchAppointments,
} from "../controllers/appointmentsController.js";

const router = express.Router();

// Create appointment
router.post("/", scheduleAppointment);

// Get all appointments
router.get("/", getAllAppointments);

// Search Appointments
router.get("/search", searchAppointments);

// Update appointment
router.patch("/:id", updateAppointment);

// Delete appointment
router.delete("/:id", deleteAppointment);

export default router;
