import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import profileRoutes from "./routes/profile.route.js";
import adminRoutes from "./routes/admin.route.js";
import translationRoutes from "./routes/translation.routes.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";
import { initEmailService } from "./emails/emailHandlers.js";

// Resolve current file path in ESM and derive directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" })); // req.body

// CORS: allow Vite dev origin and configured client URL; same-origin in prod
const isDevelopment = ENV.NODE_ENV !== "production";
const allowedOrigins = [];
if (ENV.CLIENT_URL) allowedOrigins.push(ENV.CLIENT_URL);
if (isDevelopment) {
  allowedOrigins.push("http://localhost:5173");
  allowedOrigins.push("http://localhost:5174");
  allowedOrigins.push("http://localhost:5175");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin or server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/translation", translationRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  // When running from backend/src, go up two levels to reach frontend/dist
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.resolve(__dirname, "../../frontend/dist/index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT + " with updated CORS");
  connectDB();
  initEmailService(); // Initialize email service
});