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
      profilePic,
      jobTitle,
      company,
      industry,
      experience,
      education,
      skills,
      interests,
      languages,
      socialMedia,
      contactInfo,
      timezone,
      workingHours,
      customStatus
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

    // Professional information
    if (jobTitle !== undefined) {
      if (jobTitle.length > 100) {
        return res.status(400).json({ message: "Job title cannot exceed 100 characters" });
      }
      update.jobTitle = jobTitle.trim();
    }

    if (company !== undefined) {
      if (company.length > 100) {
        return res.status(400).json({ message: "Company name cannot exceed 100 characters" });
      }
      update.company = company.trim();
    }

    if (industry !== undefined) {
      update.industry = industry.trim();
    }

    if (experience !== undefined) {
      const validExperience = ["", "entry", "junior", "mid", "senior", "lead", "executive"];
      if (!validExperience.includes(experience)) {
        return res.status(400).json({ message: "Invalid experience level" });
      }
      update.experience = experience;
    }

    if (education !== undefined) {
      update.education = education;
    }

    if (skills !== undefined) {
      if (Array.isArray(skills) && skills.length > 20) {
        return res.status(400).json({ message: "Cannot have more than 20 skills" });
      }
      update.skills = skills;
    }

    if (interests !== undefined) {
      if (Array.isArray(interests) && interests.length > 15) {
        return res.status(400).json({ message: "Cannot have more than 15 interests" });
      }
      update.interests = interests;
    }

    if (languages !== undefined) {
      update.languages = languages;
    }

    if (socialMedia !== undefined) {
      update.socialMedia = socialMedia;
    }

    if (contactInfo !== undefined) {
      update.contactInfo = contactInfo;
    }

    if (timezone !== undefined) {
      update.timezone = timezone;
    }

    if (workingHours !== undefined) {
      update.workingHours = workingHours;
    }

    if (customStatus !== undefined) {
      update.customStatus = customStatus;
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
    
    // Add activity log
    await updatedUser.addActivityLog('profile_updated', {
      fieldsUpdated: Object.keys(update)
    });
    
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
      jobTitle: updatedUser.jobTitle,
      company: updatedUser.company,
      industry: updatedUser.industry,
      experience: updatedUser.experience,
      education: updatedUser.education,
      skills: updatedUser.skills,
      interests: updatedUser.interests,
      languages: updatedUser.languages,
      socialMedia: updatedUser.socialMedia,
      contactInfo: updatedUser.contactInfo,
      timezone: updatedUser.timezone,
      workingHours: updatedUser.workingHours,
      customStatus: updatedUser.customStatus,
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

// Update profile theme
export const updateProfileTheme = async (req, res) => {
  try {
    const { profileTheme } = req.body;
    const userId = req.user._id;

    if (!profileTheme || typeof profileTheme !== "object") {
      return res.status(400).json({ message: "Profile theme data is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profileTheme } },
      { new: true, runValidators: true }
    ).select("-password");

    await updatedUser.addActivityLog('theme_updated', { theme: profileTheme });

    res.status(200).json({
      profileTheme: updatedUser.profileTheme,
      message: "Profile theme updated successfully"
    });
  } catch (error) {
    console.error("Error in updateProfileTheme:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Upload profile banner
export const uploadProfileBanner = async (req, res) => {
  try {
    const { profileBanner } = req.body;
    const userId = req.user._id;

    if (!profileBanner) {
      return res.status(400).json({ message: "Profile banner image is required" });
    }

    try {
      // Delete old banner if exists
      const currentUser = await User.findById(userId);
      if (currentUser.profileBanner && currentUser.profileBanner.includes('cloudinary')) {
        try {
          const publicId = currentUser.profileBanner.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`chatrizz/banners/${publicId}`);
        } catch (deleteError) {
          console.warn("Could not delete old profile banner:", deleteError);
        }
      }

      const uploadResponse = await cloudinary.uploader.upload(profileBanner, {
        folder: "chatrizz/banners",
        transformation: [
          { width: 1200, height: 400, crop: "fill" },
          { quality: "auto", format: "auto" }
        ]
      });

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profileBanner: uploadResponse.secure_url },
        { new: true }
      ).select("-password");

      await updatedUser.addActivityLog('banner_updated');

      res.status(200).json({
        profileBanner: updatedUser.profileBanner,
        message: "Profile banner updated successfully"
      });
    } catch (uploadError) {
      console.error("Error uploading profile banner:", uploadError);
      return res.status(400).json({ message: "Failed to upload profile banner" });
    }
  } catch (error) {
    console.error("Error in uploadProfileBanner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add image to profile gallery
export const addGalleryImage = async (req, res) => {
  try {
    const { image, caption, isPublic = true } = req.body;
    const userId = req.user._id;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const user = await User.findById(userId);
    if (user.profileGallery.length >= 10) {
      return res.status(400).json({ message: "Gallery can contain maximum 10 images" });
    }

    try {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chatrizz/gallery",
        transformation: [
          { width: 800, height: 600, crop: "fill" },
          { quality: "auto", format: "auto" }
        ]
      });

      const galleryItem = {
        url: uploadResponse.secure_url,
        caption: caption || "",
        isPublic,
        uploadedAt: new Date()
      };

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { profileGallery: galleryItem } },
        { new: true }
      ).select("-password");

      await updatedUser.addActivityLog('gallery_image_added');

      res.status(200).json({
        galleryItem,
        message: "Image added to gallery successfully"
      });
    } catch (uploadError) {
      console.error("Error uploading gallery image:", uploadError);
      return res.status(400).json({ message: "Failed to upload gallery image" });
    }
  } catch (error) {
    console.error("Error in addGalleryImage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Remove image from profile gallery
export const removeGalleryImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { profileGallery: { _id: imageId } } },
      { new: true }
    ).select("-password");

    await updatedUser.addActivityLog('gallery_image_removed');

    res.status(200).json({ message: "Image removed from gallery successfully" });
  } catch (error) {
    console.error("Error in removeGalleryImage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get activity log
export const getActivityLog = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId).select("activityLog");
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    
    const activities = user.activityLog.slice(startIndex, endIndex);
    
    res.status(200).json({
      activities,
      totalCount: user.activityLog.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(user.activityLog.length / limit)
    });
  } catch (error) {
    console.error("Error in getActivityLog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get login history
export const getLoginHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId).select("loginHistory");
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    
    const loginHistory = user.loginHistory.slice(startIndex, endIndex);
    
    res.status(200).json({
      loginHistory,
      totalCount: user.loginHistory.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(user.loginHistory.length / limit)
    });
  } catch (error) {
    console.error("Error in getLoginHistory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Export profile data
export const exportProfileData = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    const exportData = user.exportProfileData();
    
    await user.addActivityLog('profile_data_exported');
    
    res.status(200).json(exportData);
  } catch (error) {
    console.error("Error in exportProfileData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Import profile data
export const importProfileData = async (req, res) => {
  try {
    const { profileData } = req.body;
    const userId = req.user._id;

    if (!profileData || !profileData.userData) {
      return res.status(400).json({ message: "Valid profile data is required" });
    }

    const allowedFields = [
      'bio', 'location', 'phone', 'website', 'jobTitle', 'company', 'industry',
      'experience', 'education', 'skills', 'interests', 'languages', 'socialMedia',
      'contactInfo', 'timezone', 'workingHours', 'profileTheme'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (profileData.userData[field] !== undefined) {
        updateData[field] = profileData.userData[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    await updatedUser.addActivityLog('profile_data_imported');

    res.status(200).json({
      message: "Profile data imported successfully",
      updatedFields: Object.keys(updateData)
    });
  } catch (error) {
    console.error("Error in importProfileData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add verification badge
export const addVerificationBadge = async (req, res) => {
  try {
    const { badgeType, description } = req.body;
    const userId = req.user._id;

    const validBadges = ["verified", "professional", "influencer", "developer", "contributor", "beta_tester"];
    if (!validBadges.includes(badgeType)) {
      return res.status(400).json({ message: "Invalid badge type" });
    }

    const user = await User.findById(userId);
    
    if (user.hasBadge(badgeType)) {
      return res.status(400).json({ message: "Badge already exists" });
    }

    await user.addBadge(badgeType, description);

    res.status(200).json({
      message: "Badge added successfully",
      badges: user.verification.badges
    });
  } catch (error) {
    console.error("Error in addVerificationBadge:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Block user
export const blockUser = async (req, res) => {
  try {
    const { userIdToBlock } = req.body;
    const userId = req.user._id;

    if (userId.toString() === userIdToBlock) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { "privacy.blockedUsers": userIdToBlock } },
      { new: true }
    ).select("-password");

    await updatedUser.addActivityLog('user_blocked', { blockedUserId: userIdToBlock });

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const { userIdToUnblock } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { "privacy.blockedUsers": userIdToUnblock } },
      { new: true }
    ).select("-password");

    await updatedUser.addActivityLog('user_unblocked', { unblockedUserId: userIdToUnblock });

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("Error in unblockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get enhanced profile statistics
export const getEnhancedProfileStats = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stats = user.getProfileStats();
    
    // Add message count
    const messageCount = await Message.countDocuments({ senderId: id });
    stats.messageCount = messageCount;

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error in getEnhancedProfileStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};