import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useProfileStore = create((set, get) => ({
  // State
  profile: null,
  profileStats: null,
  profileActivity: null,
  activityLog: [],
  loginHistory: [],
  isLoadingProfile: false,
  isLoadingActivity: false,
  isUpdatingProfile: false,
  isUploadingImage: false,
  isUploadingBanner: false,
  isDeletingAccount: false,
  isExportingData: false,
  isImportingData: false,
  
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

  getEnhancedProfileStats: async (userId) => {
    try {
      const res = await axiosInstance.get(`/profile/${userId}/enhanced-stats`);
      set({ profileStats: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching enhanced profile stats:", error);
      toast.error("Failed to fetch enhanced profile statistics");
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
      profileActivity: null,
      activityLog: [],
      loginHistory: [],
      isLoadingProfile: false,
      isLoadingActivity: false,
      isUpdatingProfile: false,
      isUploadingImage: false,
      isUploadingBanner: false,
      isDeletingAccount: false,
      isExportingData: false,
      isImportingData: false,
    });
  },

  // New advanced features
  updateProfileTheme: async (themeData) => {
    try {
      const res = await axiosInstance.put("/profile/theme", { profileTheme: themeData });
      set((state) => ({
        profile: { ...state.profile, profileTheme: res.data.profileTheme }
      }));
      toast.success("Profile theme updated successfully");
      return res.data.profileTheme;
    } catch (error) {
      console.error("Error updating profile theme:", error);
      toast.error(error?.response?.data?.message || "Failed to update profile theme");
      throw error;
    }
  },

  uploadProfileBanner: async (bannerFile) => {
    set({ isUploadingBanner: true });
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(bannerFile);
      });

      const res = await axiosInstance.put("/profile/banner", { profileBanner: base64 });
      set((state) => ({
        profile: { ...state.profile, profileBanner: res.data.profileBanner }
      }));
      toast.success("Profile banner updated successfully");
      return res.data.profileBanner;
    } catch (error) {
      console.error("Error uploading profile banner:", error);
      toast.error(error?.response?.data?.message || "Failed to upload profile banner");
      throw error;
    } finally {
      set({ isUploadingBanner: false });
    }
  },

  addGalleryImage: async (imageFile, caption, isPublic = true) => {
    try {
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imageFile);
      });

      const res = await axiosInstance.post("/profile/gallery", {
        image: base64,
        caption,
        isPublic
      });
      
      set((state) => ({
        profile: {
          ...state.profile,
          profileGallery: [...(state.profile.profileGallery || []), res.data.galleryItem]
        }
      }));
      
      toast.success("Image added to gallery successfully");
      return res.data.galleryItem;
    } catch (error) {
      console.error("Error adding gallery image:", error);
      toast.error(error?.response?.data?.message || "Failed to add image to gallery");
      throw error;
    }
  },

  removeGalleryImage: async (imageId) => {
    try {
      await axiosInstance.delete(`/profile/gallery/${imageId}`);
      set((state) => ({
        profile: {
          ...state.profile,
          profileGallery: state.profile.profileGallery.filter(img => img._id !== imageId)
        }
      }));
      toast.success("Image removed from gallery successfully");
    } catch (error) {
      console.error("Error removing gallery image:", error);
      toast.error("Failed to remove image from gallery");
      throw error;
    }
  },

  getActivityLog: async (page = 1, limit = 20) => {
    try {
      const res = await axiosInstance.get(`/profile/activity/log?page=${page}&limit=${limit}`);
      set({ activityLog: res.data.activities });
      return res.data;
    } catch (error) {
      console.error("Error fetching activity log:", error);
      toast.error("Failed to fetch activity log");
      throw error;
    }
  },

  getLoginHistory: async (page = 1, limit = 20) => {
    try {
      const res = await axiosInstance.get(`/profile/activity/login-history?page=${page}&limit=${limit}`);
      set({ loginHistory: res.data.loginHistory });
      return res.data;
    } catch (error) {
      console.error("Error fetching login history:", error);
      toast.error("Failed to fetch login history");
      throw error;
    }
  },

  exportProfileData: async () => {
    set({ isExportingData: true });
    try {
      const res = await axiosInstance.get("/profile/data/export");
      
      // Create and download file
      const dataStr = JSON.stringify(res.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chatrizz-profile-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Profile data exported successfully");
      return res.data;
    } catch (error) {
      console.error("Error exporting profile data:", error);
      toast.error("Failed to export profile data");
      throw error;
    } finally {
      set({ isExportingData: false });
    }
  },

  importProfileData: async (profileData) => {
    set({ isImportingData: true });
    try {
      const res = await axiosInstance.post("/profile/data/import", { profileData });
      
      // Refresh profile after import
      await get().getProfile("me");
      
      toast.success(`Profile data imported successfully. Updated fields: ${res.data.updatedFields.join(', ')}`);
      return res.data;
    } catch (error) {
      console.error("Error importing profile data:", error);
      toast.error(error?.response?.data?.message || "Failed to import profile data");
      throw error;
    } finally {
      set({ isImportingData: false });
    }
  },

  addVerificationBadge: async (badgeType, description) => {
    try {
      const res = await axiosInstance.post("/profile/verification/badge", {
        badgeType,
        description
      });
      set((state) => ({
        profile: {
          ...state.profile,
          verification: {
            ...state.profile.verification,
            badges: res.data.badges
          }
        }
      }));
      toast.success("Badge added successfully");
      return res.data.badges;
    } catch (error) {
      console.error("Error adding verification badge:", error);
      toast.error(error?.response?.data?.message || "Failed to add badge");
      throw error;
    }
  },

  blockUser: async (userIdToBlock) => {
    try {
      await axiosInstance.post("/profile/block", { userIdToBlock });
      set((state) => ({
        profile: {
          ...state.profile,
          privacy: {
            ...state.profile.privacy,
            blockedUsers: [...(state.profile.privacy.blockedUsers || []), userIdToBlock]
          }
        }
      }));
      toast.success("User blocked successfully");
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
      throw error;
    }
  },

  unblockUser: async (userIdToUnblock) => {
    try {
      await axiosInstance.post("/profile/unblock", { userIdToUnblock });
      set((state) => ({
        profile: {
          ...state.profile,
          privacy: {
            ...state.profile.privacy,
            blockedUsers: (state.profile.privacy.blockedUsers || []).filter(id => id !== userIdToUnblock)
          }
        }
      }));
      toast.success("User unblocked successfully");
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
      throw error;
    }
  },

  updateProfileGallery: async (galleryData) => {
    try {
      const res = await axiosInstance.put("/profile/gallery", { profileGallery: galleryData });
      set((state) => ({
        profile: { ...state.profile, profileGallery: res.data.profileGallery }
      }));
      toast.success("Gallery updated successfully");
      return res.data.profileGallery;
    } catch (error) {
      console.error("Error updating gallery:", error);
      toast.error(error?.response?.data?.message || "Failed to update gallery");
      throw error;
    }
  },

  getProfileActivity: async () => {
    set({ isLoadingActivity: true });
    try {
      const res = await axiosInstance.get("/profile/activity");
      set({ profileActivity: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching profile activity:", error);
      // Use mock data for now if API fails
      const mockActivity = [
        {
          id: 1,
          type: "login",
          title: "Logged in",
          description: "User logged in from Chrome browser",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          location: "New York, USA",
          ip: "192.168.1.1"
        },
        {
          id: 2,
          type: "profile_update",
          title: "Profile Updated",
          description: "Updated bio and profile picture",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        }
      ];
      set({ profileActivity: mockActivity });
      return mockActivity;
    } finally {
      set({ isLoadingActivity: false });
    }
  },
}));