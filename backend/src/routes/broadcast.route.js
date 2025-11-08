import express from "express";
import { sendBroadcastMessage, getBroadcastHistory } from "../controllers/broadcast.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// Apply rate limiting and authentication to all routes
router.use(arcjetProtection, protectRoute);

// Broadcast messaging routes
router.post("/send", sendBroadcastMessage); // Send broadcast message
router.get("/history", getBroadcastHistory); // Get broadcast message history

export default router;