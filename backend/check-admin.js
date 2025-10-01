import mongoose from "mongoose";
import User from "./src/models/User.js";
import { connectDB } from "./src/lib/db.js";

const checkAdminUsers = async () => {
  try {
    await connectDB();
    
    const superAdmin = await User.findOne({ role: "superadmin" });
    console.log("Super admin user:", superAdmin ? superAdmin.email : "None found");
    
    const admins = await User.find({ role: "admin" });
    console.log("Admin users:", admins.length);
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email}`);
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
};

checkAdminUsers();