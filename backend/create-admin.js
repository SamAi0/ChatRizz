import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";
import { connectDB } from "./src/lib/db.js";

const createAdminUser = async () => {
  try {
    // Get arguments from command line
    const email = process.argv[2];
    const password = process.argv[3];
    const fullName = process.argv[4] || "Admin User";
    
    if (!email || !password) {
      console.log("Usage: node create-admin.js <email> <password> [full_name]");
      console.log("Example: node create-admin.js admin@example.com mypassword 'John Admin'");
      process.exit(1);
    }
    
    // Connect to the database
    await connectDB();
    
    // Check if admin already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Admin user with email ${email} already exists`);
      console.log("User ID:", existingUser._id);
      console.log("Role:", existingUser.role);
      mongoose.connection.close();
      return;
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new admin user
    const newAdmin = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      role: "admin",
    });
    
    // Save the user
    const savedAdmin = await newAdmin.save();
    
    console.log("Admin user created successfully!");
    console.log("User ID:", savedAdmin._id);
    console.log("Email:", savedAdmin.email);
    console.log("Full Name:", savedAdmin.fullName);
    console.log("Role:", savedAdmin.role);
    // Note: Not printing password for security
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating admin user:", error);
    mongoose.connection.close();
  }
};

createAdminUser();