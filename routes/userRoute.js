import express from "express";
import * as userController from "../controllers/userController.js";
const router = express.Router();

// Get all users
router.get("/", userController.getUsers);

// Update a user
router.patch("/:id", userController.updateUser);

// Delete a user
router.delete("/:id", userController.deleteUser);


export default router;
