import express from "express";
import * as authController from "../controllers/authController.js";
const router = express.Router();

// Register a new user
router.post("/signup", authController.signup);

// Logout
router.patch("/logout", authController.logout);

export default router;
