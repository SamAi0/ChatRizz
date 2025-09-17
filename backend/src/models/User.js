import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    profilePic: {
      type: String,
      default: "",
    },
    statusText: {
      type: String,
      default: "Available",
      maxlength: 50,
    },
    // Enhanced profile fields
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      default: "",
      maxlength: 100,
    },
    phone: {
      type: String,
      default: "",
      maxlength: 20,
    },
    website: {
      type: String,
      default: "",
      maxlength: 200,
    },
    // Professional Information
    jobTitle: {
      type: String,
      default: "",
      maxlength: 100,
    },
    company: {
      type: String,
      default: "",
      maxlength: 100,
    },
    industry: {
      type: String,
      default: "",
      maxlength: 50,
    },
    experience: {
      type: String,
      enum: ["", "entry", "junior", "mid", "senior", "lead", "executive"],
      default: "",
    },
    education: {
      degree: {
        type: String,
        default: "",
        maxlength: 100,
      },
      institution: {
        type: String,
        default: "",
        maxlength: 100,
      },
      graduationYear: {
        type: Number,
        min: 1950,
        max: new Date().getFullYear() + 10,
      },
      fieldOfStudy: {
        type: String,
        default: "",
        maxlength: 100,
      },
    },
    // Skills and Interests
    skills: [{
      name: {
        type: String,
        required: true,
        maxlength: 30,
      },
      level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "expert"],
        default: "beginner",
      },
      verified: {
        type: Boolean,
        default: false,
      },
    }],
    interests: [{
      type: String,
      maxlength: 30,
    }],
    languages: [{
      name: {
        type: String,
        required: true,
        maxlength: 30,
      },
      proficiency: {
        type: String,
        enum: ["basic", "conversational", "fluent", "native"],
        default: "basic",
      },
    }],
    // Social Media Links
    socialMedia: {
      linkedin: {
        type: String,
        default: "",
        maxlength: 200,
      },
      twitter: {
        type: String,
        default: "",
        maxlength: 200,
      },
      github: {
        type: String,
        default: "",
        maxlength: 200,
      },
      instagram: {
        type: String,
        default: "",
        maxlength: 200,
      },
      facebook: {
        type: String,
        default: "",
        maxlength: 200,
      },
      youtube: {
        type: String,
        default: "",
        maxlength: 200,
      },
      portfolio: {
        type: String,
        default: "",
        maxlength: 200,
      },
    },
    // Profile Customization
    profileTheme: {
      backgroundColor: {
        type: String,
        default: "#0f172a", // slate-900
      },
      accentColor: {
        type: String,
        default: "#06b6d4", // cyan-500
      },
      layout: {
        type: String,
        enum: ["modern", "classic", "minimal", "creative"],
        default: "modern",
      },
      fontStyle: {
        type: String,
        enum: ["default", "serif", "mono", "rounded"],
        default: "default",
      },
    },
    // Profile Images Gallery
    profileGallery: [{
      url: {
        type: String,
        required: true,
      },
      caption: {
        type: String,
        maxlength: 100,
      },
      isPublic: {
        type: Boolean,
        default: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // Profile Banner
    profileBanner: {
      type: String,
      default: "",
    },
    // Contact Information
    contactInfo: {
      alternateEmail: {
        type: String,
        default: "",
      },
      telegram: {
        type: String,
        default: "",
        maxlength: 50,
      },
      discord: {
        type: String,
        default: "",
        maxlength: 50,
      },
      skype: {
        type: String,
        default: "",
        maxlength: 50,
      },
      whatsapp: {
        type: String,
        default: "",
        maxlength: 20,
      },
    },
    // Profile Activity & Status
    customStatus: {
      emoji: {
        type: String,
        default: "",
      },
      text: {
        type: String,
        default: "",
        maxlength: 100,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    workingHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      start: {
        type: String,
        default: "09:00",
      },
      end: {
        type: String,
        default: "17:00",
      },
      days: [{
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      }],
    },
    // Privacy and preferences
    privacy: {
      showEmail: {
        type: Boolean,
        default: false,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
      showLocation: {
        type: Boolean,
        default: true,
      },
      showOnlineStatus: {
        type: Boolean,
        default: true,
      },
      allowContactFromStrangers: {
        type: Boolean,
        default: true,
      },
      showAge: {
        type: Boolean,
        default: false,
      },
      showProfessionalInfo: {
        type: Boolean,
        default: true,
      },
      showSocialMedia: {
        type: Boolean,
        default: true,
      },
      showSkills: {
        type: Boolean,
        default: true,
      },
      showInterests: {
        type: Boolean,
        default: true,
      },
      showGallery: {
        type: Boolean,
        default: true,
      },
      restrictedCountries: [{
        type: String,
      }],
      blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
      allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
    },
    // Chat preferences
    preferences: {
      theme: {
        type: String,
        enum: ["dark", "light", "auto"],
        default: "dark",
      },
      soundEnabled: {
        type: Boolean,
        default: true,
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: "en",
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      autoAwayTime: {
        type: Number,
        default: 15, // minutes
      },
      messagePreview: {
        type: Boolean,
        default: true,
      },
      readReceipts: {
        type: Boolean,
        default: true,
      },
      typingIndicators: {
        type: Boolean,
        default: true,
      },
      onlineStatusVisible: {
        type: Boolean,
        default: true,
      },
    },
    // Account settings
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deactivated"],
      default: "active",
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now,
    },
    // Profile verification
    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
      verificationLevel: {
        type: String,
        enum: ["", "email", "phone", "id", "professional"],
        default: "",
      },
      badges: [{
        type: {
          type: String,
          enum: ["verified", "professional", "influencer", "developer", "contributor", "beta_tester"],
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        description: String,
      }],
    },
    // Activity tracking
    activityLog: [{
      action: {
        type: String,
        required: true,
      },
      details: {
        type: mongoose.Schema.Types.Mixed,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      ipAddress: String,
      userAgent: String,
    }],
    loginHistory: [{
      timestamp: {
        type: Date,
        default: Date.now,
      },
      ipAddress: String,
      userAgent: String,
      location: String,
      success: {
        type: Boolean,
        default: true,
      },
    }],
    // Profile status
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // createdAt & updatedAt
);

// Virtual for calculating age
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Check if profile is complete
userSchema.methods.checkProfileCompleteness = function() {
  const requiredFields = ['fullName', 'email'];
  const optionalFields = ['bio', 'profilePic', 'location', 'jobTitle', 'skills'];
  
  const hasRequired = requiredFields.every(field => this[field] && this[field].trim());
  const hasOptional = optionalFields.some(field => {
    if (field === 'skills') {
      return this.skills && this.skills.length > 0;
    }
    return this[field] && this[field].trim();
  });
  
  this.isProfileComplete = hasRequired && hasOptional;
  return this.isProfileComplete;
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActiveAt = new Date();
  return this.save();
};

// Add activity log entry
userSchema.methods.addActivityLog = function(action, details = {}) {
  this.activityLog.unshift({
    action,
    details,
    timestamp: new Date()
  });
  
  // Keep only last 100 entries
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(0, 100);
  }
  
  return this.save();
};

// Add login history entry
userSchema.methods.addLoginHistory = function(ipAddress, userAgent, location, success = true) {
  this.loginHistory.unshift({
    timestamp: new Date(),
    ipAddress,
    userAgent,
    location,
    success
  });
  
  // Keep only last 50 entries
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(0, 50);
  }
  
  return this.save();
};

// Check if user has specific badge
userSchema.methods.hasBadge = function(badgeType) {
  return this.verification.badges.some(badge => badge.type === badgeType);
};

// Add verification badge
userSchema.methods.addBadge = function(badgeType, description = '') {
  if (!this.hasBadge(badgeType)) {
    this.verification.badges.push({
      type: badgeType,
      earnedAt: new Date(),
      description
    });
  }
  return this.save();
};

// Get profile statistics
userSchema.methods.getProfileStats = function() {
  return {
    completeness: this.checkProfileCompleteness() ? 100 : 75,
    skillsCount: this.skills.length,
    interestsCount: this.interests.length,
    socialLinksCount: Object.values(this.socialMedia).filter(link => link).length,
    galleryCount: this.profileGallery.length,
    badgesCount: this.verification.badges.length,
    isVerified: this.verification.isVerified,
    memberSince: this.createdAt,
    lastActive: this.lastActiveAt
  };
};

// Export profile data
userSchema.methods.exportProfileData = function() {
  const user = this.toObject();
  delete user.password;
  delete user.activityLog;
  delete user.loginHistory;
  delete user.privacy.blockedUsers;
  delete user.privacy.allowedUsers;
  
  return {
    exportedAt: new Date(),
    version: '1.0',
    userData: user
  };
};

const User = mongoose.model("User", userSchema);

export default User;
