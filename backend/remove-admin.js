import mongoose from "mongoose";
import User from "./src/models/User.js";
import { connectDB } from "./src/lib/db.js";

const removeAdminUser = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Get email from command line arguments
    const email = process.argv[2];
    
    if (!email) {
      console.log("Usage: node remove-admin.js <email>");
      console.log("Please provide an email as a command line argument");
      mongoose.connection.close();
      return;
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      console.log(`User with email ${email} does not exist`);
      mongoose.connection.close();
      return;
    }
    
    // Remove the user
    await User.deleteOne({ email });
    
    console.log(`User with email ${email} has been removed successfully!`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error removing user:", error);
    mongoose.connection.close();
  }
};

removeAdminUser();