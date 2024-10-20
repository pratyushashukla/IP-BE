import express from "express";
import { executeMiddleware } from "./lib/middleware.js";
import * as auth from "./lib/auth.js";

import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";

import User from "./models/userModel.js";
import { connect } from "./config/dbconnection.js";

import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
executeMiddleware(app);

//Check Auth for each API
const allowedURLs = ["/api/v1/auth"];

const allowedEndpoints = ["/login", "/signup", "/forgot-password", "/reset-password"];

const isAllowedURL = (req) => {
  return allowedURLs.some((baseURL) =>
    allowedEndpoints.some((endpoint) => req.url === `${baseURL}${endpoint}`)
  );
};

// Function to check for session timeout (inactivity)
const checkSessionTimeout = async (userData) => {
  const currentTime = Date.now();
  const lastActivity = userData.lastActivityTime || currentTime;
  const timeoutLimit = 30 * 60 * 1000; // 30 minutes timeout

  if (currentTime - lastActivity > timeoutLimit) {
    // Invalidate the session due to inactivity
    userData.tokenStatus = false;
    userData.tokenCreatedAt = null;
    await userData.save();
    return { status: false, message: "Session expired due to inactivity." };
  }

  // Update last activity time if the session is still valid
  userData.lastActivityTime = currentTime;
  await userData.save();
  return { status: true };
};


// Check JWT for each request
const handleAuthToken = async (req, res, next) => {
  if (req.headers?.authtoken) {
    const result = auth.verifyToken(req.headers?.authtoken);

    if (result?.status === true) {
      try {
        const userData = await User.findById({ _id: result.payload?.userId }).exec();

        if (userData?.tokenStatus) {
          // Check session timeout 
          const sessionCheck = await checkSessionTimeout(userData);
          if (!sessionCheck.status) {
            return res.status(401).json({ message: sessionCheck.message });
          }

          global.user = userData;
          next();
        } else {
          res.status(404).json({ message: "User does not exist or is already logged out" });
        }
      } catch (error) {
        console.log("Error while getting user info", error);
        res.status(500).json({
          message: "Unable to find user information due to technical error",
          error: error.message,
        });
      }
    } else {
      res.status(401).json({ message: result.message ? result.message : "Invalid Token" });
    }
  } else {
    res.status(401).json({ message: "Missing auth token in headers" });
  }
};


// above functions are called here
app.use(async function (req, res, next) {
  if (req.method === "OPTIONS" || isAllowedURL(req)) {
    next();
  } else {
    handleAuthToken(req, res, next);
  }
});

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);

//create connection
connect();

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
