import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isVerifyingEmail: false,
  isResendingOTP: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in authCheck:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      
      if (res.data.needsVerification) {
        // User needs email verification
        toast.success(res.data.message);
        return {
          needsVerification: true,
          email: res.data.email,
          userId: res.data.userId
        };
      } else {
        // Old flow - immediate registration (shouldn't happen with new flow)
        set({ authUser: res.data });
        toast.success("Account created successfully!");
        get().connectSocket();
        return { needsVerification: false };
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error?.response?.data?.message || "Signup failed. Check Network tab and server logs.");
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      
      if (res.data.needsVerification) {
        // User needs email verification
        toast.error(res.data.message);
        return {
          needsVerification: true,
          email: res.data.email,
          userId: res.data.userId
        };
      } else {
        set({ authUser: res.data });
        toast.success("Logged in successfully");
        get().connectSocket();
        return { needsVerification: false };
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.message || "Login failed. Check Network tab and server logs.");
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/profile/update", data);
      set({ authUser: { ...get().authUser, ...res.data } });
      toast.success("Profile updated successfully");
      return res.data;
    } catch (error) {
      console.log("Error in update profile:", error);
      toast.error(error?.response?.data?.message || "Profile update failed.");
      throw error;
    }
  },

  verifyEmail: async (data) => {
    set({ isVerifyingEmail: true });
    try {
      const res = await axiosInstance.post("/auth/verify-email", data);
      set({ authUser: res.data.user });
      toast.success(res.data.message);
      get().connectSocket();
      return res.data;
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error(error?.response?.data?.message || "Email verification failed. Check Network tab and server logs.");
      throw error;
    } finally {
      set({ isVerifyingEmail: false });
    }
  },

  resendOTP: async (data) => {
    set({ isResendingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/resend-otp", data);
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(error?.response?.data?.message || "Failed to resend OTP. Check Network tab and server logs.");
      throw error;
    } finally {
      set({ isResendingOTP: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, // this ensures cookies are sent with the connection
    });

    socket.connect();

    set({ socket });

    // listen for online users event
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  setAuthUser: (user) => {
    set({ authUser: user });
  },
}));