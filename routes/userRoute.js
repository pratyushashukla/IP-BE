import express from "express";
import * as userController from "../controllers/userController.js";
import { clearRedixCache, saveDataToRedis, sendDataFromRedis } from '../lib/redis.js';

const router = express.Router();
const cacheKey = "/users"

// Create a new user
router.post("/", clearRedixCache(cacheKey), userController.createUser);

// Get all users
router.get("/", saveDataToRedis(), sendDataFromRedis, userController.getUsers);

// Get a user by ID
router.get("/:id", userController.getUserById);

// Update a user
router.patch("/:id", clearRedixCache(cacheKey), userController.updateUser);

// Delete a user
router.delete("/:id", clearRedixCache(cacheKey), userController.deleteUser);


export default router;
