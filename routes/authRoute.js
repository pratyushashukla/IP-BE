import express from "express";
import * as authController from "../controllers/authController.js";
const router = express.Router();

// Register a new user
router.post("/signup", authController.signup);

// Login
router.patch("/login", authController.login);

// Logout
router.patch("/logout", authController.logout);

// forgot password
router.patch("/forgot-password", authController.forgotPassword);

export default router;
