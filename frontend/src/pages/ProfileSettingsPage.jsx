import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeftIcon, 
  ShieldIcon, 
  BellIcon, 
  PaletteIcon, 
  KeyIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  TrashIcon,
  SaveIcon,
  AlertTriangleIcon
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useProfileStore } from "../store/useProfileStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();
  const { 
    profile, 
    getProfile,
    updatePrivacySettings,
    updatePreferences,
    changePassword,
    deleteAccount,
    isDeletingAccount
  } = useProfileStore();
  const { resetChatStore } = useChatStore();

  const [activeTab, setActiveTab] = useState("privacy");
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showOnlineStatus: true,
    allowContactFromStrangers: true,
  });
  
  const [preferences, setPreferences] = useState({
    theme: "dark",
    soundEnabled: true,
    notificationsEnabled: true,
    language: "en",
    emailNotifications: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [deleteForm, setDeleteForm] = useState({
    password: "",
    confirmation: ""
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    getProfile("me");
  }, [getProfile]);

  useEffect(() => {
    if (profile) {
      setPrivacySettings(profile.privacy || {});
      setPreferences(profile.preferences || {});
    }
  }, [profile]);

  const handlePrivacyUpdate = async () => {
    try {
      await updatePrivacySettings(privacySettings);
    } catch (error) {
      console.error("Error updating privacy settings:", error);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      await updatePreferences(preferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (deleteForm.confirmation !== "DELETE MY ACCOUNT") {
      toast.error("Please type 'DELETE MY ACCOUNT' to confirm");
      return;
    }

    if (!deleteForm.password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      await deleteAccount(deleteForm.password, deleteForm.confirmation);
      resetChatStore();
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const tabs = [
    { id: "privacy", label: "Privacy", icon: ShieldIcon },
    { id: "preferences", label: "Preferences", icon: PaletteIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "security", label: "Security", icon: KeyIcon },
    { id: "account", label: "Account", icon: UserIcon },
  ];

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-slate-200" />
          </button>
          <h1 className="text-xl font-semibold text-slate-200">Profile Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-cyan-600 text-white"
                          : "text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6">
              {/* Privacy Settings */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-200 mb-4">Privacy Settings</h2>
                    <p className="text-slate-400 mb-6">
                      Control what information other users can see about you.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-slate-200 font-medium">Show Email Address</h3>
                        <p className="text-slate-400 text-sm">Allow others to see your email address</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.showEmail}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            showEmail: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-slate-200 font-medium">Show Phone Number</h3>
                        <p className="text-slate-400 text-sm">Allow others to see your phone number</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.showPhone}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            showPhone: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-slate-200 font-medium">Show Location</h3>
                        <p className="text-slate-400 text-sm">Allow others to see your location</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.showLocation}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            showLocation: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-slate-200 font-medium">Show Online Status</h3>
                        <p className="text-slate-400 text-sm">Allow others to see when you're online</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.showOnlineStatus}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            showOnlineStatus: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-slate-200 font-medium">Allow Contact from Strangers</h3>
                        <p className="text-slate-400 text-sm">Allow people you haven't chatted with to message you</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allowContactFromStrangers}
                          onChange={(e) => setPrivacySettings({
                            ...privacySettings,
                            allowContactFromStrangers: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handlePrivacyUpdate}
                    className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <SaveIcon className="w-4 h-4 mr-2 inline" />
                    Save Privacy Settings
                  </button>
                </div>
              )}

              {/* Preferences */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-200 mb-4">Preferences</h2>
                    <p className="text-slate-400 mb-6">
                      Customize your app experience.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <h3 className="text-slate-200 font-medium mb-2">Theme</h3>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          theme: e.target.value
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <h3 className="text-slate-200 font-medium mb-2">Language</h3>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          language: e.target.value
                        })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-slate-200 font-medium">Sound Effects</h3>
                        <p className="text-slate-400 text-sm">Play sounds for actions and notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.soundEnabled}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            soundEnabled: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handlePreferencesUpdate}
                    className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <SaveIcon className="w-4 h-4 mr-2 inline" />
                    Save Preferences
                  </button>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-200 mb-4">Notification Settings</h2>
                    <p className="text-slate-400 mb-6">
                      Control how and when you receive notifications.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-slate-200 font-medium">Push Notifications</h3>
                        <p className="text-slate-400 text-sm">Receive push notifications for new messages</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.notificationsEnabled}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            notificationsEnabled: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <h3 className="text-slate-200 font-medium">Email Notifications</h3>
                        <p className="text-slate-400 text-sm">Receive email notifications for important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            emailNotifications: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handlePreferencesUpdate}
                    className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <SaveIcon className="w-4 h-4 mr-2 inline" />
                    Save Notification Settings
                  </button>
                </div>
              )}

              {/* Security */}
              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-200 mb-4">Security Settings</h2>
                    <p className="text-slate-400 mb-6">
                      Manage your account security and password.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current
                          })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.current ? (
                            <EyeOffIcon className="h-4 w-4 text-slate-400" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none pr-10"
                          required
                          minLength="6"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new
                          })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.new ? (
                            <EyeOffIcon className="h-4 w-4 text-slate-400" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-200 text-sm font-medium mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value
                          })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-cyan-500 focus:outline-none pr-10"
                          required
                          minLength="6"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm
                          })}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.confirm ? (
                            <EyeOffIcon className="h-4 w-4 text-slate-400" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      <KeyIcon className="w-4 h-4 mr-2 inline" />
                      Change Password
                    </button>
                  </form>
                </div>
              )}

              {/* Account Management */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-200 mb-4">Account Management</h2>
                    <p className="text-slate-400 mb-6">
                      Manage your account settings and data.
                    </p>
                  </div>

                  {/* Danger Zone */}
                  <div className="border border-red-600/50 rounded-lg p-6 bg-red-900/10">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangleIcon className="w-5 h-5 text-red-400" />
                      <h3 className="text-red-400 font-semibold">Danger Zone</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-slate-200 font-medium mb-2">Delete Account</h4>
                        <p className="text-slate-400 text-sm mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        
                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                          <div>
                            <label className="block text-slate-200 text-sm font-medium mb-2">
                              Enter your password to confirm
                            </label>
                            <input
                              type="password"
                              value={deleteForm.password}
                              onChange={(e) => setDeleteForm({
                                ...deleteForm,
                                password: e.target.value
                              })}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-red-500 focus:outline-none"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-slate-200 text-sm font-medium mb-2">
                              Type "DELETE MY ACCOUNT" to confirm
                            </label>
                            <input
                              type="text"
                              value={deleteForm.confirmation}
                              onChange={(e) => setDeleteForm({
                                ...deleteForm,
                                confirmation: e.target.value
                              })}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-red-500 focus:outline-none"
                              placeholder="DELETE MY ACCOUNT"
                              required
                            />
                          </div>
                          
                          <button
                            type="submit"
                            disabled={isDeletingAccount}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <TrashIcon className="w-4 h-4 mr-2 inline" />
                            {isDeletingAccount ? "Deleting Account..." : "Delete Account"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;