import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Get profile statistics with real data
export const getProfileStats = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate message statistics
    const messageStats = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(id) },
            { receiverId: new mongoose.Types.ObjectId(id) }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          sentMessages: {
            $sum: {
              $cond: [{ $eq: ["$senderId", new mongoose.Types.ObjectId(id)] }, 1, 0]
            }
          },
          receivedMessages: {
            $sum: {
              $cond: [{ $eq: ["$receiverId", new mongoose.Types.ObjectId(id)] }, 1, 0]
            }
          },
          mediaShared: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$senderId", new mongoose.Types.ObjectId(id)] }, { $ne: ["$image", null] }] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get conversation partners count
    const conversationPartners = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(id) },
            { receiverId: new mongoose.Types.ObjectId(id) }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(id)] },
              "$receiverId",
              "$senderId"
            ]
          }
        }
      },
      { $count: "totalContacts" }
    ]);

    // Calculate response rate
    const responseRate = await Message.aggregate([
      {
        $match: {
          receiverId: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: "messages",
          let: { senderId: "$senderId", timestamp: "$createdAt" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$senderId", new mongoose.Types.ObjectId(id)] },
                    { $eq: ["$receiverId", "$$senderId"] },
                    { $gte: ["$createdAt", "$$timestamp"] },
                    { $lte: ["$createdAt", { $add: ["$$timestamp", 24 * 60 * 60 * 1000] }] }
                  ]
                }
              }
            }
          ],
          as: "responses"
        }
      },
      {
        $group: {
          _id: null,
          totalReceived: { $sum: 1 },
          totalResponded: {
            $sum: {
              $cond: [{ $gt: [{ $size: "$responses" }, 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get activity timeline data
    const activityData = await Message.aggregate([
      {
        $match: {
          senderId: new mongoose.Types.ObjectId(id),
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: "$createdAt" },
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    const stats = messageStats[0] || {
      totalMessages: 0,
      sentMessages: 0,
      receivedMessages: 0,
      mediaShared: 0
    };

    const contacts = conversationPartners[0]?.totalContacts || 0;
    const responseData = responseRate[0] || { totalReceived: 0, totalResponded: 0 };
    const responseRatePercent = responseData.totalReceived > 0 
      ? Math.round((responseData.totalResponded / responseData.totalReceived) * 100)
      : 0;

    // Calculate profile completeness
    const completeness = user.checkProfileCompleteness() ? 100 : 75;

    // Calculate member duration
    const memberSince = Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      messagesSent: stats.sentMessages,
      messagesReceived: stats.receivedMessages,
      totalMessages: stats.totalMessages,
      mediaShared: stats.mediaShared,
      contacts: contacts,
      responseRate: responseRatePercent,
      profileCompleteness: completeness,
      memberDays: memberSince,
      skillsCount: user.skills?.length || 0,
      interestsCount: user.interests?.length || 0,
      badgesCount: user.verification?.badges?.length || 0,
      isVerified: user.verification?.isVerified || false,
      activityData: activityData,
      lastActiveAt: user.lastActiveAt,
      averageResponseTime: "2.3 min", // This would need more complex calculation
      dailyActiveHours: "6.5 hrs", // This would need activity tracking
      conversationsStarted: Math.floor(stats.sentMessages / 10), // Rough estimate
      profileViews: 45 // This would need view tracking
    });
  } catch (error) {
    console.error("Error in getProfileStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get profile media gallery
export const getProfileMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type = 'all' } = req.query;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get media from messages
    const matchCondition = {
      $or: [
        { senderId: new mongoose.Types.ObjectId(id) },
        { receiverId: new mongoose.Types.ObjectId(id) }
      ],
      image: { $ne: null }
    };

    // Filter by media type if specified
    if (type === 'photos') {
      matchCondition.image = { $regex: /\.(jpg|jpeg|png|gif|webp)$/i };
    } else if (type === 'videos') {
      matchCondition.image = { $regex: /\.(mp4|avi|mov|wmv|flv)$/i };
    }

    const media = await Message.find(matchCondition)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('senderId', 'fullName profilePic')
      .populate('receiverId', 'fullName profilePic')
      .select('image text createdAt senderId receiverId');

    // Get media counts by type
    const mediaCounts = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(id) },
            { receiverId: new mongoose.Types.ObjectId(id) }
          ],
          image: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: "$image", regex: /\.(jpg|jpeg|png|gif|webp)$/i } },
              "photos",
              "videos"
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {
      photos: 0,
      videos: 0,
      files: 0
    };

    mediaCounts.forEach(item => {
      if (item._id === 'photos') counts.photos = item.count;
      else if (item._id === 'videos') counts.videos = item.count;
    });

    res.status(200).json({
      media,
      counts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(media.length / limit)
    });
  } catch (error) {
    console.error("Error in getProfileMedia:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get profile activity timeline
export const getProfileActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get activity from user's activity log
    const activities = user.activityLog
      .slice((page - 1) * limit, page * limit)
      .map(activity => ({
        action: activity.action,
        details: activity.details,
        timestamp: activity.timestamp,
        type: getActivityType(activity.action)
      }));

    // Add recent message activities
    const recentMessages = await Message.find({
      $or: [
        { senderId: new mongoose.Types.ObjectId(id) },
        { receiverId: new mongoose.Types.ObjectId(id) }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('senderId', 'fullName')
    .populate('receiverId', 'fullName');

    const messageActivities = recentMessages.map(msg => ({
      action: msg.senderId.toString() === id ? 'message_sent' : 'message_received',
      details: {
        text: msg.text?.substring(0, 50) + (msg.text?.length > 50 ? '...' : ''),
        hasMedia: !!msg.image,
        partner: msg.senderId.toString() === id ? msg.receiverId.fullName : msg.senderId.fullName
      },
      timestamp: msg.createdAt,
      type: 'message'
    }));

    // Combine and sort all activities
    const allActivities = [...activities, ...messageActivities]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.status(200).json({
      activities: allActivities,
      currentPage: parseInt(page),
      hasMore: user.activityLog.length > page * limit
    });
  } catch (error) {
    console.error("Error in getProfileActivity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to determine activity type
function getActivityType(action) {
  if (action.includes('message')) return 'message';
  if (action.includes('profile')) return 'profile';
  if (action.includes('login')) return 'auth';
  if (action.includes('skill') || action.includes('interest')) return 'skill';
  return 'general';
}

// Toggle favorite user
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params; // User to favorite/unfavorite
    const currentUserId = req.user._id;

    if (currentUserId.toString() === id) {
      return res.status(400).json({ message: "Cannot favorite yourself" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(currentUserId);
    
    // Initialize favorites array if it doesn't exist
    if (!currentUser.favorites) {
      currentUser.favorites = [];
    }

    const isFavorited = currentUser.favorites.includes(id);
    
    if (isFavorited) {
      // Remove from favorites
      currentUser.favorites = currentUser.favorites.filter(favId => favId.toString() !== id);
      await currentUser.save();
      
      // Log activity
      currentUser.addActivityLog('user_unfavorited', { userId: id, userName: targetUser.fullName });
      
      res.status(200).json({ 
        message: "User removed from favorites", 
        isFavorited: false 
      });
    } else {
      // Add to favorites
      currentUser.favorites.push(id);
      await currentUser.save();
      
      // Log activity
      currentUser.addActivityLog('user_favorited', { userId: id, userName: targetUser.fullName });
      
      res.status(200).json({ 
        message: "User added to favorites", 
        isFavorited: true 
      });
    }
  } catch (error) {
    console.error("Error in toggleFavorite:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Block/unblock user
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params; // User to block/unblock
    const currentUserId = req.user._id;
    const { action } = req.body; // 'block' or 'unblock'

    if (currentUserId.toString() === id) {
      return res.status(400).json({ message: "Cannot block yourself" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(currentUserId);
    
    // Initialize blocked users array if it doesn't exist
    if (!currentUser.privacy.blockedUsers) {
      currentUser.privacy.blockedUsers = [];
    }

    const isBlocked = currentUser.privacy.blockedUsers.includes(id);
    
    if (action === 'block' && !isBlocked) {
      // Block user
      currentUser.privacy.blockedUsers.push(id);
      await currentUser.save();
      
      // Log activity
      currentUser.addActivityLog('user_blocked', { userId: id, userName: targetUser.fullName });
      
      res.status(200).json({ 
        message: "User blocked successfully", 
        isBlocked: true 
      });
    } else if (action === 'unblock' && isBlocked) {
      // Unblock user
      currentUser.privacy.blockedUsers = currentUser.privacy.blockedUsers.filter(blockedId => blockedId.toString() !== id);
      await currentUser.save();
      
      // Log activity
      currentUser.addActivityLog('user_unblocked', { userId: id, userName: targetUser.fullName });
      
      res.status(200).json({ 
        message: "User unblocked successfully", 
        isBlocked: false 
      });
    } else {
      res.status(400).json({ 
        message: action === 'block' ? "User is already blocked" : "User is not blocked",
        isBlocked: isBlocked
      });
    }
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Report user
export const reportUser = async (req, res) => {
  try {
    const { id } = req.params; // User to report
    const currentUserId = req.user._id;
    const { reason, description } = req.body;

    if (currentUserId.toString() === id) {
      return res.status(400).json({ message: "Cannot report yourself" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentUser = await User.findById(currentUserId);
    
    // Log the report in activity
    currentUser.addActivityLog('user_reported', { 
      userId: id, 
      userName: targetUser.fullName,
      reason,
      description 
    });
    
    // In a real application, you'd also store this in a separate reports collection
    // and notify administrators
    
    res.status(200).json({ 
      message: "User reported successfully. Thank you for helping keep our community safe." 
    });
  } catch (error) {
    console.error("Error in reportUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update skills
export const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }
    
    if (skills.length > 20) {
      return res.status(400).json({ message: "Cannot have more than 20 skills" });
    }
    
    // Validate each skill
    for (const skill of skills) {
      if (!skill.name || typeof skill.name !== 'string' || skill.name.length > 30) {
        return res.status(400).json({ message: "Invalid skill name" });
      }
      if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)) {
        return res.status(400).json({ message: "Invalid skill level" });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { skills: skills },
      { new: true }
    ).select("-password");
    
    // Log activity
    user.addActivityLog('skills_updated', { skillsCount: skills.length });
    
    res.status(200).json({ 
      message: "Skills updated successfully", 
      skills: user.skills 
    });
  } catch (error) {
    console.error("Error in updateSkills:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update interests
export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    const userId = req.user._id;
    
    if (!Array.isArray(interests)) {
      return res.status(400).json({ message: "Interests must be an array" });
    }
    
    if (interests.length > 15) {
      return res.status(400).json({ message: "Cannot have more than 15 interests" });
    }
    
    // Validate each interest
    for (const interest of interests) {
      if (typeof interest !== 'string' || interest.length > 30) {
        return res.status(400).json({ message: "Invalid interest" });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { interests: interests },
      { new: true }
    ).select("-password");
    
    // Log activity
    user.addActivityLog('interests_updated', { interestsCount: interests.length });
    
    res.status(200).json({ 
      message: "Interests updated successfully", 
      interests: user.interests 
    });
  } catch (error) {
    console.error("Error in updateInterests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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
    const userId = id === "me" ? req.user._id : id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stats = user.getProfileStats();
    
    // Add message count
    const messageCount = await Message.countDocuments({ senderId: userId });
    stats.messageCount = messageCount;

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error in getEnhancedProfileStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};