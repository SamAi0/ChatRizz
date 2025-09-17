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
  const optionalFields = ['bio', 'profilePic'];
  
  const hasRequired = requiredFields.every(field => this[field] && this[field].trim());
  const hasOptional = optionalFields.some(field => this[field] && this[field].trim());
  
  this.isProfileComplete = hasRequired && hasOptional;
  return this.isProfileComplete;
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActiveAt = new Date();
  return this.save();
};

const User = mongoose.model("User", userSchema);

export default User;
