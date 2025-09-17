import express from "express";
import {
  getUserProfile,
  getMyProfile,
  updateProfile,
  updatePrivacySettings,
  updatePreferences,
  changePassword,
  deleteProfilePicture,
  getProfileStats,
  deleteAccount,
  permanentDeleteAccount,
  reactivateAccount,
  validateProfileData,
} from "../controllers/profile.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

// Apply rate limiting and authentication to all routes
router.use(arcjetProtection, protectRoute);

// Profile management routes
router.get("/me", getMyProfile); // Get current user's profile
router.get("/:id", getUserProfile); // Get any user's profile (public view)
router.get("/:id/stats", getProfileStats); // Get profile statistics

router.put("/update", validateProfileData, updateProfile); // Update profile information
router.put("/privacy", updatePrivacySettings); // Update privacy settings
router.put("/preferences", updatePreferences); // Update user preferences
router.put("/change-password", changePassword); // Change password

router.delete("/picture", deleteProfilePicture); // Delete profile picture
router.delete("/account", deleteAccount); // Soft delete account
router.delete("/account/permanent", permanentDeleteAccount); // Permanent delete

// Account reactivation (doesn't require authentication)
router.post("/reactivate", reactivateAccount); // Reactivate deactivated account

export default router;