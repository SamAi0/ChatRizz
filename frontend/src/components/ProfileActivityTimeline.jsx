import { useState, useEffect } from "react";
import { ActivityIcon, ClockIcon, MapPinIcon, MonitorIcon, SmartphoneIcon } from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";

const ProfileActivityTimeline = ({ isOpen, onClose }) => {
  const { getActivityLog, getLoginHistory, activityLog, loginHistory } = useProfileStore();
  const [activeTab, setActiveTab] = useState("activity");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        getActivityLog(1, 50),
        getLoginHistory(1, 50)
      ]);
    } catch (error) {
      console.error("Error loading activity data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 7) {
      return date.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'profile_updated': return '✏️';
      case 'theme_updated': return '🎨';
      case 'banner_updated': return '🖼️';
      case 'gallery_image_added': return '📸';
      case 'gallery_image_removed': return '🗑️';
      case 'user_blocked': return '🚫';
      case 'user_unblocked': return '✅';
      case 'profile_data_exported': return '📤';
      case 'profile_data_imported': return '📥';
      default: return '📝';
    }
  };

  const getActivityDescription = (action, details) => {
    switch (action) {
      case 'profile_updated':
        return `Updated profile fields: ${details?.fieldsUpdated?.join(', ') || 'multiple fields'}`;
      case 'theme_updated':
        return `Changed profile theme to ${details?.theme?.layout || 'custom'} layout`;
      case 'banner_updated':
        return 'Updated profile banner';
      case 'gallery_image_added':
        return 'Added new image to gallery';
      case 'gallery_image_removed':
        return 'Removed image from gallery';
      case 'user_blocked':
        return 'Blocked a user';
      case 'user_unblocked':
        return 'Unblocked a user';
      case 'profile_data_exported':
        return 'Exported profile data';
      case 'profile_data_imported':
        return 'Imported profile data';
      default:
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getDeviceIcon = (userAgent) => {
    if (userAgent?.includes('Mobile') || userAgent?.includes('Android') || userAgent?.includes('iPhone')) {
      return <SmartphoneIcon className="w-4 h-4" />;
    }
    return <MonitorIcon className="w-4 h-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Activity Timeline
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "activity"
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-400"
              }`}
            >
              Profile Activity
            </button>
            <button
              onClick={() => setActiveTab("logins")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "logins"
                  ? "border-cyan-500 text-cyan-400"
                  : "border-transparent text-slate-400"
              }`}
            >
              Login History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <>
              {/* Activity Tab */}
              {activeTab === "activity" && (
                <div className="space-y-4">
                  {activityLog.length > 0 ? (
                    activityLog.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <div className="text-2xl">{getActivityIcon(activity.action)}</div>
                        <div className="flex-1">
                          <p className="text-slate-200 font-medium">
                            {getActivityDescription(activity.action, activity.details)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-slate-400 text-sm">
                            <ClockIcon className="w-3 h-3" />
                            {formatDate(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <ActivityIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No activity recorded yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Login History Tab */}
              {activeTab === "logins" && (
                <div className="space-y-4">
                  {loginHistory.length > 0 ? (
                    loginHistory.map((login, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <div className={`p-2 rounded-full ${login.success ? 'bg-green-600' : 'bg-red-600'}`}>
                          {getDeviceIcon(login.userAgent)}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-200 font-medium">
                            {login.success ? 'Successful login' : 'Failed login attempt'}
                          </p>
                          <div className="space-y-1 mt-1 text-slate-400 text-sm">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-3 h-3" />
                              {formatDate(login.timestamp)}
                            </div>
                            {login.ipAddress && (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                                IP: {login.ipAddress}
                              </div>
                            )}
                            {login.location && (
                              <div className="flex items-center gap-2">
                                <MapPinIcon className="w-3 h-3" />
                                {login.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <ClockIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No login history available</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileActivityTimeline;