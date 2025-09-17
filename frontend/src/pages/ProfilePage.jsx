import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  CameraIcon, 
  EditIcon, 
  SaveIcon, 
  XIcon,
  MapPinIcon,
  CalendarIcon,
  LinkIcon,
  PhoneIcon,
  MailIcon,
  MessageCircleIcon,
  UserIcon,
  SettingsIcon,
  TrashIcon
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
    profileStats, 
    isLoadingProfile, 
    isUpdatingProfile,
    isUploadingImage,
    getProfile, 
    getProfileStats,
    updateProfile,
    updateProfilePicture,
    deleteProfilePicture
  } = useProfileStore();
  const { setSelectedUser } = useChatStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    bio: "",
    statusText: "",
    location: "",
    website: "",
    phone: "",
    dateOfBirth: ""
  });

  const isOwnProfile = !userId || userId === "me" || userId === authUser?._id;

  useEffect(() => {
    const targetUserId = userId || "me";
    getProfile(targetUserId);
    getProfileStats(targetUserId);
  }, [userId, getProfile, getProfileStats]);

  useEffect(() => {
    if (profile && isEditing) {
      setEditForm({
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        statusText: profile.statusText || "",
        location: profile.location || "",
        website: profile.website || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ""
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
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (window.confirm("Are you sure you want to delete your profile picture?")) {
      try {
        await deleteProfilePicture();
      } catch (error) {
        console.error("Error deleting profile picture:", error);
      }
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

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">Profile Not Found</h2>
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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <SaveIcon className="w-4 h-4 mr-2 inline" />
                    {isUpdatingProfile ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <XIcon className="w-4 h-4 mr-2 inline" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <EditIcon className="w-4 h-4 mr-2 inline" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => navigate("/profile/settings")}
                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 mr-2 inline" />
                    Settings
                  </button>
                </>
              )}
            </div>
          )}
          
          {!isOwnProfile && (
            <button
              onClick={handleStartChat}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <MessageCircleIcon className="w-4 h-4 mr-2 inline" />
              Message
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-700">
                <img
                  src={profile.profilePic || "/avatar.png"}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {isOwnProfile && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 bg-cyan-600 rounded-full hover:bg-cyan-700 transition-colors"
                      disabled={isUploadingImage}
                    >
                      <CameraIcon className="w-4 h-4 text-white" />
                    </button>
                    {profile.profilePic && (
                      <button
                        onClick={handleDeleteProfilePicture}
                        className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
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

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                    placeholder="Full Name"
                  />
                  
                  <input
                    type="text"
                    value={editForm.statusText}
                    onChange={(e) => setEditForm({...editForm, statusText: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                    placeholder="Status Text"
                  />
                  
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                    placeholder="Bio"
                    rows="3"
                    maxLength="500"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-slate-200">{profile.fullName}</h2>
                  <p className="text-cyan-400 text-sm">{profile.statusText || "Available"}</p>
                  {profile.bio && (
                    <p className="text-slate-300 mt-2">{profile.bio}</p>
                  )}
                </div>
              )}

              {/* Profile Stats */}
              {profileStats && (
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-400">{profileStats.messageCount || 0}</div>
                    <div className="text-slate-400">Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-400">{profileStats.daysSinceJoined}</div>
                    <div className="text-slate-400">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-400">
                      {profile.isProfileComplete ? "100%" : "50%"}
                    </div>
                    <div className="text-slate-400">Complete</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Profile Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            {(isOwnProfile || profile.email) && (
              <div className="flex items-center gap-3">
                <MailIcon className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm text-slate-400">Email</div>
                  <div className="text-slate-200">{profile.email}</div>
                </div>
              </div>
            )}

            {/* Phone */}
            {isEditing ? (
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Phone Number"
                />
              </div>
            ) : (
              (isOwnProfile || profile.phone) && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-400">Phone</div>
                    <div className="text-slate-200">{profile.phone || "Not provided"}</div>
                  </div>
                </div>
              )
            )}

            {/* Location */}
            {isEditing ? (
              <div className="flex items-center gap-3">
                <MapPinIcon className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Location"
                />
              </div>
            ) : (
              (isOwnProfile || profile.location) && (
                <div className="flex items-center gap-3">
                  <MapPinIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-400">Location</div>
                    <div className="text-slate-200">{profile.location || "Not provided"}</div>
                  </div>
                </div>
              )
            )}

            {/* Website */}
            {isEditing ? (
              <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                  placeholder="Website URL"
                />
              </div>
            ) : (
              (isOwnProfile || profile.website) && (
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-400">Website</div>
                    <div className="text-slate-200">
                      {profile.website ? (
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Date of Birth */}
            {isEditing ? (
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            ) : (
              (isOwnProfile || profile.dateOfBirth) && (
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="text-sm text-slate-400">Date of Birth</div>
                    <div className="text-slate-200">
                      {profile.dateOfBirth ? (
                        <>
                          {formatDate(profile.dateOfBirth)}
                          {calculateAge(profile.dateOfBirth) && (
                            <span className="text-slate-400 ml-2">
                              (Age: {calculateAge(profile.dateOfBirth)})
                            </span>
                          )}
                        </>
                      ) : (
                        "Not provided"
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Member Since */}
            <div className="flex items-center gap-3">
              <UserIcon className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-sm text-slate-400">Member Since</div>
                <div className="text-slate-200">{formatDate(profile.createdAt)}</div>
              </div>
            </div>

            {/* Last Active */}
            {profile.lastActiveAt && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-sm text-slate-400">Last Active</div>
                  <div className="text-slate-200">{formatDate(profile.lastActiveAt)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;