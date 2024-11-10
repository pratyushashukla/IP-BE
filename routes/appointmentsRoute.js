import express from "express";
import {
  scheduleAppointment,
  getAllAppointments,
  updateAppointment,
  deleteAppointment,
  searchAppointments,
} from "../controllers/appointmentsController.js";
import { clearRedixCache, saveDataToRedis, sendDataFromRedis } from '../lib/redis.js';

const router = express.Router();
const cacheKey = "/appointments"

// Create appointment
router.post("/", clearRedixCache(cacheKey), scheduleAppointment);

// Get all appointments
router.get("/", saveDataToRedis(), sendDataFromRedis, getAllAppointments);

// Search Appointments
router.get("/search", searchAppointments);

// Update appointment
router.patch("/:id", clearRedixCache(cacheKey), updateAppointment);

// Delete appointment
router.delete("/:id", clearRedixCache(cacheKey), deleteAppointment);

export default router;
