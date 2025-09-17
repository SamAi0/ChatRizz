import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useProfileStore = create((set, get) => ({
  // State
  profile: null,
  profileStats: null,
  isLoadingProfile: false,
  isUpdatingProfile: false,
  isUploadingImage: false,
  isDeletingAccount: false,
  
  // Actions
  getProfile: async (userId = "me") => {
    set({ isLoadingProfile: true });
    try {
      const res = await axiosInstance.get(`/profile/${userId}`);
      set({ profile: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(error?.response?.data?.message || "Failed to fetch profile");
      throw error;
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  getProfileStats: async (userId) => {
    try {
      const res = await axiosInstance.get(`/profile/${userId}/stats`);
      set({ profileStats: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching profile stats:", error);
      toast.error("Failed to fetch profile statistics");
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/profile/update", profileData);
      set((state) => ({
        profile: { ...state.profile, ...res.data }
      }));
      toast.success("Profile updated successfully");
      return res.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateProfilePicture: async (imageFile) => {
    set({ isUploadingImage: true });
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });

      const res = await axiosInstance.put("/profile/update", { profilePic: base64 });
      set((state) => ({
        profile: { ...state.profile, profilePic: res.data.profilePic }
      }));
      toast.success("Profile picture updated successfully");
      return res.data.profilePic;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error(error?.response?.data?.message || "Failed to upload profile picture");
      throw error;
    } finally {
      set({ isUploadingImage: false });
    }
  },

  deleteProfilePicture: async () => {
    try {
      await axiosInstance.delete("/profile/picture");
      set((state) => ({
        profile: { ...state.profile, profilePic: "" }
      }));
      toast.success("Profile picture deleted successfully");
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      toast.error("Failed to delete profile picture");
      throw error;
    }
  },

  updatePrivacySettings: async (privacyData) => {
    try {
      const res = await axiosInstance.put("/profile/privacy", { privacy: privacyData });
      set((state) => ({
        profile: { ...state.profile, privacy: res.data.privacy }
      }));
      toast.success("Privacy settings updated successfully");
      return res.data.privacy;
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      toast.error(error?.response?.data?.message || "Failed to update privacy settings");
      throw error;
    }
  },

  updatePreferences: async (preferencesData) => {
    try {
      const res = await axiosInstance.put("/profile/preferences", { preferences: preferencesData });
      set((state) => ({
        profile: { ...state.profile, preferences: res.data.preferences }
      }));
      toast.success("Preferences updated successfully");
      return res.data.preferences;
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error(error?.response?.data?.message || "Failed to update preferences");
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      await axiosInstance.put("/profile/change-password", passwordData);
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error?.response?.data?.message || "Failed to change password");
      throw error;
    }
  },

  deleteAccount: async (password, confirmation) => {
    set({ isDeletingAccount: true });
    try {
      await axiosInstance.delete("/profile/account", { 
        data: { password, confirmation } 
      });
      toast.success("Account deleted successfully");
      // Note: After account deletion, user should be logged out
      return true;
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error?.response?.data?.message || "Failed to delete account");
      throw error;
    } finally {
      set({ isDeletingAccount: false });
    }
  },

  reactivateAccount: async (email, password) => {
    try {
      await axiosInstance.post("/profile/reactivate", { email, password });
      toast.success("Account reactivated successfully. Please log in again.");
      return true;
    } catch (error) {
      console.error("Error reactivating account:", error);
      toast.error(error?.response?.data?.message || "Failed to reactivate account");
      throw error;
    }
  },

  // Reset store
  resetProfileStore: () => {
    set({
      profile: null,
      profileStats: null,
      isLoadingProfile: false,
      isUpdatingProfile: false,
      isUploadingImage: false,
      isDeletingAccount: false,
    });
  },
}));