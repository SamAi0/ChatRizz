import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";

// Get user profile (public view)
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;
    
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare response based on privacy settings
    const response = {
      _id: user._id,
      fullName: user.fullName,
      profilePic: user.profilePic,
      statusText: user.statusText,
      bio: user.bio,
      location: user.privacy.showLocation ? user.location : "",
      website: user.website,
      isProfileComplete: user.isProfileComplete,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    };

    // Only show private info if it's the user's own profile
    if (currentUserId.toString() === id) {
      response.email = user.email;
      response.phone = user.privacy.showPhone ? user.phone : "";
      response.dateOfBirth = user.dateOfBirth;
      response.age = user.age;
      response.privacy = user.privacy;
      response.preferences = user.preferences;
    } else {
      // Show limited info based on privacy settings
      if (user.privacy.showEmail) response.email = user.email;
      if (user.privacy.showPhone) response.phone = user.phone;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current user's complete profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    // Check and update profile completeness
    user.checkProfileCompleteness();
    await user.save();

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      statusText: user.statusText,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth,
      age: user.age,
      location: user.location,
      phone: user.phone,
      website: user.website,
      privacy: user.privacy,
      preferences: user.preferences,
      isProfileComplete: user.isProfileComplete,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastActiveAt: user.lastActiveAt,
    });
  } catch (error) {
    console.error("Error in getMyProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update profile information
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      bio,
      dateOfBirth,
      location,
      phone,
      website,
      statusText,
      profilePic
    } = req.body;

    const userId = req.user._id;
    const update = {};

    // Basic profile updates with validation
    if (fullName !== undefined) {
      if (fullName.length < 2 || fullName.length > 50) {
        return res.status(400).json({ message: "Full name must be between 2 and 50 characters" });
      }
      update.fullName = fullName.trim();
    }
    
    if (bio !== undefined) {
      if (bio.length > 500) {
        return res.status(400).json({ message: "Bio cannot exceed 500 characters" });
      }
      update.bio = bio.trim();
    }
    
    if (dateOfBirth !== undefined) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        return res.status(400).json({ message: "Date of birth cannot be in the future" });
      }
      update.dateOfBirth = dateOfBirth;
    }
    
    if (location !== undefined) {
      if (location.length > 100) {
        return res.status(400).json({ message: "Location cannot exceed 100 characters" });
      }
      update.location = location.trim();
    }
    
    if (phone !== undefined) {
      if (phone && !/^[\+]?[1-9][\d]{0,14}$/.test(phone.replace(/\s/g, ''))) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }
      update.phone = phone.trim();
    }
    
    if (website !== undefined) {
      if (website && !/^https?:\/\/.+/.test(website)) {
        return res.status(400).json({ message: "Website must be a valid URL starting with http:// or https://" });
      }
      update.website = website.trim();
    }
    
    if (statusText !== undefined) {
      if (statusText.length > 50) {
        return res.status(400).json({ message: "Status text cannot exceed 50 characters" });
      }
      update.statusText = statusText.trim();
    }

    // Handle profile picture upload
    if (profilePic) {
      try {
        // Delete old profile picture if exists
        const currentUser = await User.findById(userId);
        if (currentUser.profilePic && currentUser.profilePic.includes('cloudinary')) {
          try {
            const publicId = currentUser.profilePic.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`chatrizz/profiles/${publicId}`);
          } catch (deleteError) {
            console.warn("Could not delete old profile picture:", deleteError);
          }
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "chatrizz/profiles",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", format: "auto" }
          ]
        });
        update.profilePic = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Error uploading profile picture:", uploadError);
        return res.status(400).json({ message: "Failed to upload profile picture" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, update, { 
      new: true,
      runValidators: true 
    }).select("-password");

    // Check profile completeness
    updatedUser.checkProfileCompleteness();
    await updatedUser.save();

    res.status(200).json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      statusText: updatedUser.statusText,
      bio: updatedUser.bio,
      dateOfBirth: updatedUser.dateOfBirth,
      location: updatedUser.location,
      phone: updatedUser.phone,
      website: updatedUser.website,
      isProfileComplete: updatedUser.isProfileComplete,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update privacy settings
export const updatePrivacySettings = async (req, res) => {
  try {
    const { privacy } = req.body;
    const userId = req.user._id;

    if (!privacy || typeof privacy !== "object") {
      return res.status(400).json({ message: "Privacy settings are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { privacy } },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      privacy: updatedUser.privacy,
      message: "Privacy settings updated successfully"
    });
  } catch (error) {
    console.error("Error in updatePrivacySettings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user preferences
export const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user._id;

    if (!preferences || typeof preferences !== "object") {
      return res.status(400).json({ message: "Preferences are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      preferences: updatedUser.preferences,
      message: "Preferences updated successfully"
    });
  } catch (error) {
    console.error("Error in updatePreferences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    
    // Verify current password
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete profile picture
export const deleteProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { profilePic: "" });

    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProfilePicture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get profile stats (messages sent, joined date, etc.)
export const getProfileStats = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Count messages sent by user
    const messageCount = await Message.countDocuments({ senderId: id });

    // Calculate days since joining
    const joinedDate = user.createdAt;
    const daysSinceJoined = Math.floor((Date.now() - joinedDate) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      joinedDate,
      daysSinceJoined,
      messageCount,
      isProfileComplete: user.isProfileComplete,
      lastActiveAt: user.lastActiveAt,
    });
  } catch (error) {
    console.error("Error in getProfileStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete account (soft delete)
export const deleteAccount = async (req, res) => {
  try {
    const { password, confirmation } = req.body;
    const userId = req.user._id;

    if (!password || confirmation !== "DELETE MY ACCOUNT") {
      return res.status(400).json({ 
        message: "Password and confirmation text 'DELETE MY ACCOUNT' are required" 
      });
    }

    const user = await User.findById(userId);
    
    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Soft delete - mark account as deactivated
    await User.findByIdAndUpdate(userId, { 
      accountStatus: "deactivated",
      email: `deleted_${Date.now()}_${user.email}`, // Prevent email conflicts
      fullName: "Deleted User",
      profilePic: "",
      bio: "",
      statusText: "Account Deleted"
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Permanently delete account (admin only or after grace period)
export const permanentDeleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user._id;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(userId);
    
    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Delete user's messages
    await Message.deleteMany({ senderId: userId });
    
    // Delete profile picture from Cloudinary if exists
    if (user.profilePic && user.profilePic.includes('cloudinary')) {
      try {
        const publicId = user.profilePic.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`chatrizz/profiles/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting profile picture from Cloudinary:", cloudinaryError);
      }
    }

    // Permanently delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account permanently deleted" });
  } catch (error) {
    console.error("Error in permanentDeleteAccount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reactivate account
export const reactivateAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find deactivated account
    const user = await User.findOne({ 
      email: { $regex: `deleted_\\d+_${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$` },
      accountStatus: "deactivated"
    });

    if (!user) {
      return res.status(404).json({ message: "Deactivated account not found" });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Reactivate account
    await User.findByIdAndUpdate(user._id, {
      accountStatus: "active",
      email: email, // Restore original email
      statusText: "Available"
    });

    res.status(200).json({ message: "Account reactivated successfully" });
  } catch (error) {
    console.error("Error in reactivateAccount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Validate profile data
export const validateProfileData = (req, res, next) => {
  const { email, fullName, phone, website, bio } = req.body;
  const errors = [];

  // Email validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }

  // Full name validation
  if (fullName && (fullName.length < 2 || fullName.length > 50)) {
    errors.push("Full name must be between 2 and 50 characters");
  }

  // Phone validation
  if (phone && !/^[\+]?[1-9][\d]{0,14}$/.test(phone.replace(/\s/g, ''))) {
    errors.push("Invalid phone number format");
  }

  // Website validation
  if (website && !/^https?:\/\/.+/.test(website)) {
    errors.push("Website must be a valid URL starting with http:// or https://");
  }

  // Bio validation
  if (bio && bio.length > 500) {
    errors.push("Bio cannot exceed 500 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(", ") });
  }

  next();
};