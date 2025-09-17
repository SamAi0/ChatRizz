import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized - No token provided" });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid token" });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "admin" && user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden - Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in requireAdmin middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requireSuperAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized - No token provided" });

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid token" });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden - Super admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in requireSuperAdmin middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};