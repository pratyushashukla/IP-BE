import express from "express";
import * as userController from "../controllers/userController.js";
const router = express.Router();

// Get all users
router.get("/", userController.getUsers);

// Get a user by ID
router.get("/:id", userController.getUserById);

export default router;
