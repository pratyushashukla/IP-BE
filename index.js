import express from "express";
import { executeMiddleware } from "./lib/middleware.js";
import * as auth from "./lib/auth.js";

import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import tasksRoute from "./routes/tasksRoute.js";
import inmateRoute from "./routes/inmateRoute.js";
import visitorRoute from "./routes/visitorRoute.js";
import appointmentsRoute from "./routes/appointmentsRoute.js";
import mealRoute from "./routes/mealRoute.js";
import allergyRoute from "./routes/allergyRoute.js";
import reportRoute from "./routes/reportRoute.js";

import User from "./models/userModel.js";
import { connect } from "./config/dbconnection.js";

import dotenv from "dotenv";
import { redisConnect } from "./lib/redis.js";

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware
executeMiddleware(app);

//Check Auth for each API
const allowedURLs = ["/api/v1/auth"];

const allowedEndpoints = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-code",
  "/resend-code",
];

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
  const authToken = req.headers?.authtoken;
  if (!authToken) {
    return res.status(401).json({ message: "Missing auth token in headers" });
  }
  const result = auth.verifyToken(authToken);

  if (!result?.status) {
    // Clear the authentication cookie
    res.clearCookie("authtoken");
    // Send 401 response with a message instructing the client to redirect
    return res.status(401).json({
      message: result?.message || "Invalid Token. Redirecting to sign-in.",
    });
  }

  try {
    const userData = await User.findById({
      _id: result.payload?.userId,
    }).exec();

    if (!userData || !userData.tokenStatus) {
      return res
        .status(404)
        .json({ message: "User does not exist or is already logged out" });
    }
    // Check session timeout
    const sessionCheck = await checkSessionTimeout(userData);
    if (!sessionCheck.status) {
      return res.status(401).json({ message: sessionCheck.message });
    }
    // refresh the token to extend the session
    const newToken = auth.createToken(userData._id, userData.email);
    res.setHeader("authtoken", `${newToken.token}`);
    // Set user data in req.user for access in subsequent middleware or routes
    req.user = { userId: userData._id, email: userData.email };
  
    global.user = userData;
    next();
  } catch (error) {
    console.log("Error while getting user info", error);
    res.status(500).json({
      message: "Unable to find user information due to technical error",
      error: error.message,
    });
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
app.use("/api/v1/tasks", tasksRoute);
app.use("/api/v1/inmates", inmateRoute);
app.use("/api/v1/visitors", visitorRoute);
app.use("/api/v1/appointments", appointmentsRoute);
app.use("/api/v1/meals", mealRoute);
app.use("/api/v1/allergies", allergyRoute);
app.use("/api/v1/reports", reportRoute);

//create connection
connect();

//redis connection
redisConnect();

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
