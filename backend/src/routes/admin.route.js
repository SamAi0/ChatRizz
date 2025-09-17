import express from "express";
import {
  adminLogin,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getDashboardStats,
  createAdmin,
} from "../controllers/admin.controller.js";
import { requireAdmin, requireSuperAdmin } from "../middleware/admin.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection);

// Admin authentication
router.post("/login", adminLogin);

// Protected admin routes
router.get("/users", requireAdmin, getAllUsers);
router.get("/dashboard/stats", requireAdmin, getDashboardStats);
router.delete("/users/:userId", requireAdmin, deleteUser);

// Super admin only routes
router.post("/create-admin", requireSuperAdmin, createAdmin);
router.patch("/users/:userId/role", requireSuperAdmin, updateUserRole);

export default router;