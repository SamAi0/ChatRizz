import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  CameraIcon, 
  EditIcon, 
  SaveIcon, 
  XIcon,
  CheckIcon
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useProfileStore } from "../store/useProfileStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const { authUser } = useAuthStore();
  const { 
    profile, 
    isLoadingProfile, 
    isUpdatingProfile,
    isUploadingImage,
    getProfile, 
    updateProfile,
    updateProfilePicture
  } = useProfileStore();
  const { setSelectedUser } = useChatStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    bio: "",
    statusText: ""
  });

  const isOwnProfile = !userId || userId === "me" || userId === authUser?._id;
  console.log("isOwnProfile check - userId:", userId, "authUser._id:", authUser?._id, "isOwnProfile:", isOwnProfile);

  useEffect(() => {
    if (!authUser) {
      return;
    }
    
    const targetUserId = userId || "me";
    getProfile(targetUserId);
  }, [userId, getProfile, authUser]);

  useEffect(() => {
    if (profile && isEditing) {
      setEditForm({
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        statusText: profile.statusText || ""
      });
    }
  }, [profile, isEditing]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      await updateProfilePicture(file);
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to update profile picture");
    }
  };

  const handleEditClick = () => {
    console.log("Edit button clicked, current isEditing:", isEditing);
    setIsEditing(true);
    console.log("Set isEditing to true");
  };

  const handleSaveProfile = async () => {
    console.log("Save button clicked, editForm:", editForm);
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleStartChat = () => {
    setSelectedUser(profile);
    navigate("/");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Debug logging
  console.log("ProfilePage render - isEditing:", isEditing, "isOwnProfile:", isOwnProfile, "profile:", profile);

  // Loading states
  if (!authUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Profile Not Found</h2>
          <p className="text-slate-400 mb-4">Could not load profile data</p>
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-200" />
            </button>
            <h1 className="text-xl font-semibold text-slate-200">
              {isOwnProfile ? "My Profile" : `${profile.fullName}'s Profile`}
            </h1>
          </div>
          
          {isOwnProfile && (
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdatingProfile}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <SaveIcon className="w-4 h-4" />
                    {isUpdatingProfile ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <XIcon className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
                >
                  <EditIcon className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          )}
          
          {!isOwnProfile && (
            <button
              onClick={handleStartChat}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2"
            >
              <CheckIcon className="w-4 h-4" />
              Message
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700/50">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-700 border-4 border-slate-600">
                <img
                  src={profile.profilePic || "/avatar.png"}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {isOwnProfile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-cyan-600 rounded-full hover:bg-cyan-700 transition-colors"
                    disabled={isUploadingImage}
                  >
                    <CameraIcon className="w-6 h-6 text-white" />
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {isUploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Online/Offline Indicator */}
            <div className="mt-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-400 text-sm font-medium">Online</span>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Enter your username"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-700/30 rounded-lg">
                  <p className="text-xl font-semibold text-slate-200">{profile.fullName || "No username set"}</p>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
              <div className="px-4 py-3 bg-slate-700/30 rounded-lg">
                <p className="text-slate-200">{profile.email || "No email set"}</p>
              </div>
            </div>

            {/* Bio/Status */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Bio / Status</label>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-200">{profile.bio || "No bio set"}</p>
                </div>
              )}
            </div>

            {/* Status Text */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Status Message</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.statusText}
                  onChange={(e) => setEditForm({...editForm, statusText: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="What's on your mind?"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-200">{profile.statusText || "Available"}</p>
                </div>
              )}
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Member Since</label>
              <div className="px-4 py-3 bg-slate-700/30 rounded-lg">
                <p className="text-slate-200">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;