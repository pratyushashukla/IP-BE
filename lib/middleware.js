import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { json } from "express";

export const executeMiddleware = (app) => {
  // Middlewares

  // 1. Rate Limiting
  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 1000, // limit each IP to 100 requests per windowMs
    message: "You exceeded 100 requests in 5 minutes!",
    headers: true,
  });
  app.use(limiter);

  // 2. CORS with added security headers
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
      exposedHeaders: ["set-cookie", "authtoken", "csrf-token"],
    })
  );

  // 3. Helmet Middleware for additional security headers
  app.use(helmet());

  // 4. Cookie Parser Middleware
  app.use(cookieParser());

  // 5. JSON Parsing Middleware
  app.use(
    json({
      type: "application/json",
    })
  );
};
