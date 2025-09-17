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
  updateProfileTheme,
  uploadProfileBanner,
  addGalleryImage,
  removeGalleryImage,
  getActivityLog,
  getLoginHistory,
  exportProfileData,
  importProfileData,
  addVerificationBadge,
  blockUser,
  unblockUser,
  getEnhancedProfileStats,
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
router.get("/:id/enhanced-stats", getEnhancedProfileStats); // Get enhanced profile statistics

router.put("/update", validateProfileData, updateProfile); // Update profile information
router.put("/privacy", updatePrivacySettings); // Update privacy settings
router.put("/preferences", updatePreferences); // Update user preferences
router.put("/change-password", changePassword); // Change password
router.put("/theme", updateProfileTheme); // Update profile theme
router.put("/banner", uploadProfileBanner); // Upload profile banner

// Gallery management
router.post("/gallery", addGalleryImage); // Add image to gallery
router.delete("/gallery/:imageId", removeGalleryImage); // Remove image from gallery

// Activity and history
router.get("/activity/log", getActivityLog); // Get activity log
router.get("/activity/login-history", getLoginHistory); // Get login history

// Data management
router.get("/data/export", exportProfileData); // Export profile data
router.post("/data/import", importProfileData); // Import profile data

// Verification and badges
router.post("/verification/badge", addVerificationBadge); // Add verification badge

// User management
router.post("/block", blockUser); // Block user
router.post("/unblock", unblockUser); // Unblock user

router.delete("/picture", deleteProfilePicture); // Delete profile picture
router.delete("/account", deleteAccount); // Soft delete account
router.delete("/account/permanent", permanentDeleteAccount); // Permanent delete

// Account reactivation (doesn't require authentication)
router.post("/reactivate", reactivateAccount); // Reactivate deactivated account

export default router;