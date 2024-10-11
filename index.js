import express from "express";
import { executeMiddleware } from "./lib/middleware.js";

import authRoute from "./routes/authRoute.js";

import User from "./models/userModel.js";
import { connect } from "./config/dbconnection.js";

import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
executeMiddleware(app);

// Routes
app.use("/api/v1/auth", authRoute);

//create connection
connect();

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
