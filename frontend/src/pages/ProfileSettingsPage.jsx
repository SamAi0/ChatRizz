import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  UserIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  GlobeIcon, 
  LockIcon, 
  SaveIcon,
  Trash2Icon,
  DownloadIcon,
  UploadIcon,
  EyeIcon,
  EyeOffIcon
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useProfileStore } from "../store/useProfileStore";
import { useTranslationStore } from "../store/useTranslationStore";
import toast from "react-hot-toast";
import Logo from "../components/Logo";

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const { authUser, checkAuth, isCheckingAuth, logout } = useAuthStore();
  const { 
    profile, 
    updateProfile,
    updatePrivacySettings,
    updatePreferences,
    changePassword,
    isUpdatingProfile,
    getProfile,
    isLoadingProfile,
    deleteAccount,
    exportProfileData,
    importProfileData,
    isDeletingAccount,
    isExportingData,
    isImportingData
  } = useProfileStore();
  
  const { preferredLanguage, autoTranslate, showOriginal, setPreferredLanguage, setAutoTranslate, setShowOriginal } = useTranslationStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    fullName: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    dateOfBirth: ""
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessagesFrom: "everyone", // everyone, contacts, nobody
    profileVisibility: "public" // public, contacts, private
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: "dark",
    notificationsEnabled: true,
    language: "en",
    autoTranslate: true,
    showOriginal: true,
    messageNotifications: true,
    soundEnabled: true,
    emailNotifications: true
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Data management state
  const [dataManagement, setDataManagement] = useState({
    exportFormat: "json",
    confirmDelete: ""
  });

  // Check authentication and fetch profile on component mount
  useEffect(() => {
    const init = async () => {
      await checkAuth();
      if (!profile) {
        await getProfile("me");
      }
    };
    init();
  }, []);

  // Initialize settings with user data
  useEffect(() => {
    if (profile) {
      setProfileSettings({
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ""
      });

      setPrivacySettings(profile.privacy || {
        showEmail: false,
        showPhone: false,
        showLocation: true,
        allowMessagesFrom: "everyone",
        profileVisibility: "public"
      });

      setPreferences({
        theme: profile.preferences?.theme || "dark",
        notificationsEnabled: profile.preferences?.notificationsEnabled ?? true,
        language: preferredLanguage || "en",
        autoTranslate: autoTranslate ?? true,
        showOriginal: showOriginal ?? true,
        messageNotifications: profile.preferences?.messageNotifications ?? true,
        soundEnabled: profile.preferences?.soundEnabled ?? true,
        emailNotifications: profile.preferences?.emailNotifications ?? true
      });
    }
  }, [profile, preferredLanguage, autoTranslate, showOriginal]);

  // Handle changes
  const handleProfileChange = (field, value) => {
    setProfileSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferencesChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleDataManagementChange = (field, value) => {
    setDataManagement(prev => ({ ...prev, [field]: value }));
  };

  // Save functions
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileSettings);
      toast.success("Profile saved successfully");
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  const handleSavePrivacy = async (e) => {
    e.preventDefault();
    try {
      await updatePrivacySettings(privacySettings);
      toast.success("Privacy settings saved");
    } catch (error) {
      toast.error("Failed to save privacy settings");
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      await updatePreferences(preferences);
      setPreferredLanguage(preferences.language);
      setAutoTranslate(preferences.autoTranslate);
      setShowOriginal(preferences.showOriginal);
      toast.success("Preferences saved successfully");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleExportData = async () => {
    try {
      await exportProfileData();
      toast.success("Data exported successfully");
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  const handleImportData = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          await importProfileData(jsonData);
          toast.success("Data imported successfully");
        } catch (error) {
          toast.error("Invalid file format");
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error("Failed to import data");
    }
  };

  const handleDeleteAccount = async () => {
    if (dataManagement.confirmDelete !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    try {
      await deleteAccount();
      toast.success("Account deleted successfully");
      logout();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  // Show loading state while checking auth or loading profile
  if (isCheckingAuth || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authUser) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <ArrowLeftIcon className="w-5 h-5 text-slate-200" />
            </button>
            <Logo 
              size="lg" 
              onClick={() => navigate("/")}
              animated={true}
            />
            <h1 className="text-xl font-semibold text-slate-200">Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              {profile?.username ? `@${profile.username}` : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 sticky top-6">
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveTab("profile")} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "profile" ? "bg-cyan-600/20 text-cyan-400" : "text-slate-300 hover:bg-slate-700/50"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("privacy")} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "privacy" ? "bg-cyan-600/20 text-cyan-400" : "text-slate-300 hover:bg-slate-700/50"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                >
                  <ShieldCheckIcon className="w-5 h-5" />
                  <span>Privacy</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("preferences")} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "preferences" ? "bg-cyan-600/20 text-cyan-400" : "text-slate-300 hover:bg-slate-700/50"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                >
                  <BellIcon className="w-5 h-5" />
                  <span>Preferences</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("translation")} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "translation" ? "bg-cyan-600/20 text-cyan-400" : "text-slate-300 hover:bg-slate-700/50"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                >
                  <GlobeIcon className="w-5 h-5" />
                  <span>Translation</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("security")} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "security" ? "bg-cyan-600/20 text-cyan-400" : "text-slate-300 hover:bg-slate-700/50"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                >
                  <LockIcon className="w-5 h-5" />
                  <span>Security</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab("data")} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "data" ? "bg-cyan-600/20 text-cyan-400" : "text-slate-300 hover:bg-slate-700/50"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                >
                  <UploadIcon className="w-5 h-5" />
                  <span>Data Management</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-slate-200 mb-6">Profile Settings</h2>
                
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileSettings.fullName}
                        onChange={(e) => handleProfileChange("fullName", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors focus:ring-2 focus:ring-cyan-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                      <input
                        type="text"
                        value={profile?.username || ""}
                        disabled
                        className="w-full px-4 py-2.5 bg-slate-700/30 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                      <textarea
                        value={profileSettings.bio}
                        onChange={(e) => handleProfileChange("bio", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors focus:ring-2 focus:ring-cyan-500"
                        placeholder="Tell us about yourself"
                        rows="4"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                      <input
                        type="text"
                        value={profileSettings.location}
                        onChange={(e) => handleProfileChange("location", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors focus:ring-2 focus:ring-cyan-500"
                        placeholder="Where are you from?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
                      <input
                        type="url"
                        value={profileSettings.website}
                        onChange={(e) => handleProfileChange("website", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors focus:ring-2 focus:ring-cyan-500"
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileSettings.phone}
                        onChange={(e) => handleProfileChange("phone", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors focus:ring-2 focus:ring-cyan-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={profileSettings.dateOfBirth}
                        onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <SaveIcon className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === "privacy" && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-slate-200 mb-6">Privacy Settings</h2>
                
                <form onSubmit={handleSavePrivacy} className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-4">Profile Visibility</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-200">Who can see your profile</div>
                          </div>
                          <select
                            value={privacySettings.profileVisibility}
                            onChange={(e) => handlePrivacyChange("profileVisibility", e.target.value)}
                            className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="public">Public</option>
                            <option value="contacts">Contacts Only</option>
                            <option value="private">Private</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-200">Show email address</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePrivacyChange("showEmail", !privacySettings.showEmail)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${privacySettings.showEmail ? "bg-cyan-600" : "bg-slate-600"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            aria-pressed={privacySettings.showEmail}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${privacySettings.showEmail ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-200">Show phone number</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePrivacyChange("showPhone", !privacySettings.showPhone)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${privacySettings.showPhone ? "bg-cyan-600" : "bg-slate-600"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            aria-pressed={privacySettings.showPhone}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${privacySettings.showPhone ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-200">Show location</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePrivacyChange("showLocation", !privacySettings.showLocation)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${privacySettings.showLocation ? "bg-cyan-600" : "bg-slate-600"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            aria-pressed={privacySettings.showLocation}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${privacySettings.showLocation ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-4">Messaging Privacy</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-200">Who can message you</div>
                          </div>
                          <select
                            value={privacySettings.allowMessagesFrom}
                            onChange={(e) => handlePrivacyChange("allowMessagesFrom", e.target.value)}
                            className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="everyone">Everyone</option>
                            <option value="contacts">Contacts Only</option>
                            <option value="nobody">Nobody</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <SaveIcon className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences */}
            {activeTab === "preferences" && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-slate-200 mb-6">Preferences</h2>
                
                <form onSubmit={handleSavePreferences} className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-4">Appearance</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
                          <select
                            value={preferences.theme}
                            onChange={(e) => handlePreferencesChange("theme", e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-slate-200 mb-4">Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-200">Enable notifications</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePreferencesChange("notificationsEnabled", !preferences.notificationsEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.notificationsEnabled ? "bg-cyan-600" : "bg-slate-600"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            aria-pressed={preferences.notificationsEnabled}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.notificationsEnabled ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-200">Message notifications</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePreferencesChange("messageNotifications", !preferences.messageNotifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.messageNotifications ? "bg-cyan-600" : "bg-slate-600"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            aria-pressed={preferences.messageNotifications}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.messageNotifications ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-200">Sound effects</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePreferencesChange("soundEnabled", !preferences.soundEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.soundEnabled ? "bg-cyan-600" : "bg-slate-600"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            aria-pressed={preferences.soundEnabled}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.soundEnabled ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-slate-200">Email notifications</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePreferencesChange("emailNotifications", !preferences.emailNotifications)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.emailNotifications ? "bg-cyan-600" : "bg-slate-600"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                            aria-pressed={preferences.emailNotifications}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.emailNotifications ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <SaveIcon className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Translation Settings */}
            {activeTab === "translation" && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-slate-200 mb-6">Translation Settings</h2>
                
                <form onSubmit={handleSavePreferences} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Language</label>
                    <select
                      value={preferences.language}
                      onChange={(e) => {
                        handlePreferencesChange("language", e.target.value);
                        setPreferredLanguage(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                      <option value="ko">Korean</option>
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-200">Auto Translate</div>
                        <div className="text-sm text-slate-400">Automatically translate messages</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newAutoTranslate = !preferences.autoTranslate;
                          handlePreferencesChange("autoTranslate", newAutoTranslate);
                          setAutoTranslate(newAutoTranslate);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.autoTranslate ? "bg-cyan-600" : "bg-slate-600"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                        aria-pressed={preferences.autoTranslate}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.autoTranslate ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-slate-200">Show Original Text</div>
                        <div className="text-sm text-slate-400">Display original text alongside translations</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newShowOriginal = !preferences.showOriginal;
                          handlePreferencesChange("showOriginal", newShowOriginal);
                          setShowOriginal(newShowOriginal);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${preferences.showOriginal ? "bg-cyan-600" : "bg-slate-600"} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                        aria-pressed={preferences.showOriginal}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.showOriginal ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <SaveIcon className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-slate-200 mb-6">Security Settings</h2>
                
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                          className="w-full px-4 py-2.5 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                        >
                          {showCurrentPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-slate-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                          className="w-full px-4 py-2.5 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          required
                          minLength="6"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                        >
                          {showNewPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-slate-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">Must be at least 6 characters</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                          className="w-full px-4 py-2.5 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                        >
                          {showConfirmPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-slate-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <SaveIcon className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Data Management */}
            {activeTab === "data" && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                <h2 className="text-xl font-semibold text-slate-200 mb-6">Data Management</h2>
                
                <div className="space-y-8">
                  {/* Export Data */}
                  <div className="border-b border-slate-700 pb-6">
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Export Data</h3>
                    <p className="text-slate-400 mb-4">
                      Download a copy of your profile data, messages, and settings.
                    </p>
                    <button
                      onClick={handleExportData}
                      disabled={isExportingData}
                      className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      {isExportingData ? "Exporting..." : "Export Data"}
                    </button>
                  </div>
                  
                  {/* Import Data */}
                  <div className="border-b border-slate-700 pb-6">
                    <h3 className="text-lg font-medium text-slate-200 mb-4">Import Data</h3>
                    <p className="text-slate-400 mb-4">
                      Upload a previously exported data file to restore your profile.
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportData}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImportingData}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <UploadIcon className="w-4 h-4" />
                      {isImportingData ? "Importing..." : "Import Data"}
                    </button>
                  </div>
                  
                  {/* Delete Account - Danger Zone */}
                  <div>
                    <h3 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h3>
                    <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                      <p className="text-slate-200 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Type "DELETE" to confirm
                        </label>
                        <input
                          type="text"
                          value={dataManagement.confirmDelete}
                          onChange={(e) => handleDataManagementChange("confirmDelete", e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="DELETE"
                        />
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount || dataManagement.confirmDelete !== "DELETE"}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <Trash2Icon className="w-4 h-4" />
                        {isDeletingAccount ? "Deleting..." : "Delete Account"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;