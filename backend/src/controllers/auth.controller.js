import { sendWelcomeEmail, sendOTPEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check if emailis valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // 123456 => $dnjasdkasj_?dmsakmk
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Persist user first but don't issue auth cookie yet
      const savedUser = await newUser.save();
      
      // Generate and send OTP
      const otp = savedUser.generateVerificationOTP();
      await savedUser.save();

      try {
        await sendOTPEmail(savedUser.email, savedUser.fullName, otp);
        
        res.status(201).json({
          message: "Account created successfully! Please check your email for verification code.",
          email: savedUser.email,
          needsVerification: true,
          userId: savedUser._id
        });
      } catch (emailError) {
        console.error("Failed to send OTP email:", emailError);
        // If email fails, delete the user to avoid orphaned accounts
        await User.findByIdAndDelete(savedUser._id);
        return res.status(500).json({ 
          message: "Failed to send verification email. Please try again." 
        });
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    // Check if email is verified
    if (!user.emailVerification.isVerified) {
      return res.status(400).json({ 
        message: "Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
        userId: user._id
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      statusText: user.statusText,
      bio: user.bio,
      isProfileComplete: user.isProfileComplete,
      privacy: user.privacy,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, statusText } = req.body;

    const userId = req.user._id;

    const update = {};
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      update.profilePic = uploadResponse.secure_url;
    }
    if (fullName) update.fullName = fullName;
    if (statusText !== undefined) update.statusText = statusText;

    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify email with OTP
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    if (!userId || !otp) {
      return res.status(400).json({ message: "User ID and OTP are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerification.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const verificationResult = user.verifyEmailOTP(otp);
    
    if (verificationResult.success) {
      await user.save();
      
      // Generate auth token after successful verification
      generateToken(user._id, res);
      
      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, user.fullName, ENV.CLIENT_URL);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
        // Don't fail the verification if welcome email fails
      }
      
      res.status(200).json({
        message: "Email verified successfully!",
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePic: user.profilePic,
          statusText: user.statusText,
          bio: user.bio,
          isProfileComplete: user.isProfileComplete,
          privacy: user.privacy,
          preferences: user.preferences,
        }
      });
    } else {
      await user.save(); // Save to update attempt count
      res.status(400).json({ message: verificationResult.message });
    }
  } catch (error) {
    console.error("Error in email verification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.emailVerification.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Check rate limiting
    if (!user.canRequestNewOTP()) {
      return res.status(429).json({ 
        message: "Please wait 2 minutes before requesting a new OTP" 
      });
    }

    // Reset attempts and generate new OTP
    user.resetVerificationAttempts();
    const otp = user.generateVerificationOTP();
    await user.save();

    try {
      await sendOTPEmail(user.email, user.fullName, otp);
      res.status(200).json({ 
        message: "New verification code sent to your email" 
      });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      res.status(500).json({ 
        message: "Failed to send verification email. Please try again." 
      });
    }
  } catch (error) {
    console.error("Error in resend OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
