import express from "express";
import {
  createGroup,
  getGroupById,
  getUserGroups,
  updateGroup,
  deleteGroup,
  addMembers,
  removeMember,
  makeAdmin,
  removeAdmin, // Add the new controller
  getGroupMessages,
  sendGroupMessage
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// Apply rate limiting and authentication to all routes
router.use(arcjetProtection, protectRoute);

// Group management routes
router.post("/", createGroup); // Create a new group
router.get("/", getUserGroups); // Get all groups for the user
router.get("/:id", getGroupById); // Get a specific group
router.put("/:id", updateGroup); // Update group settings
router.delete("/:id", deleteGroup); // Delete a group

// Member management routes
router.post("/:id/members", addMembers); // Add members to group
router.delete("/:id/members/:memberId", removeMember); // Remove member from group
router.post("/:id/admins/:memberId", makeAdmin); // Make member an admin
router.delete("/:id/admins/:memberId", removeAdmin); // Remove admin privileges

// Group messaging routes
router.get("/:id/messages", getGroupMessages); // Get group messages
router.post("/:id/messages", sendGroupMessage); // Send message to group

export default router;