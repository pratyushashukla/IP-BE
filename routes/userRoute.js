import express from "express";
import * as userController from "../controllers/userController.js";
const router = express.Router();

// Create a new user
router.post("/", userController.createUser);

// Get all users
router.get("/", userController.getUsers);

// Get a user by ID
router.get("/:id", userController.getUserById);

// Update a user
router.patch("/:id", userController.updateUser);

// Delete a user
router.delete("/:id", userController.deleteUser);


export default router;
