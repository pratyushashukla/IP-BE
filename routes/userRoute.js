import express from "express";
import * as userController from "../controllers/userController.js";
const router = express.Router();

// Get all users
router.get("/", userController.getUsers);

export default router;
