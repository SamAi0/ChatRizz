import { useState, useEffect } from "react";
import { XIcon, ActivityIcon, MapPinIcon, ClockIcon, UserIcon, MessageCircleIcon } from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";

const ProfileActivityTimeline = ({ isOpen, onClose }) => {
  const { getProfileActivity, profileActivity, isLoadingActivity } = useProfileStore();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (isOpen) {
      getProfileActivity?.();
    }
  }, [isOpen, getProfileActivity]);

  const mockActivity = [
    {
      id: 1,
      type: "login",
      title: "Logged in",
      description: "User logged in from Chrome browser",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      location: "New York, USA",
      ip: "192.168.1.1"
    },
    {
      id: 2,
      type: "profile_update",
      title: "Profile Updated",
      description: "Updated bio and profile picture",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: 3,
      type: "message",
      title: "New Message",
      description: "Sent a message to John Doe",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      id: 4,
      type: "login",
      title: "Logged in",
      description: "User logged in from Firefox browser",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      location: "Los Angeles, USA",
      ip: "192.168.1.2"
    },
    {
      id: 5,
      type: "profile_update",
      title: "Profile Updated",
      description: "Updated contact information",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    }
  ];

  const activities = profileActivity || mockActivity;

  const getActivityIcon = (type) => {
    switch (type) {
      case "login":
        return <UserIcon className="w-4 h-4" />;
      case "message":
        return <MessageCircleIcon className="w-4 h-4" />;
      case "profile_update":
        return <ActivityIcon className="w-4 h-4" />;
      default:
        return <ActivityIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "login":
        return "text-green-400 bg-green-400/20";
      case "message":
        return "text-blue-400 bg-blue-400/20";
      case "profile_update":
        return "text-cyan-400 bg-cyan-400/20";
      default:
        return "text-slate-400 bg-slate-400/20";
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === "all") return true;
    return activity.type === filter;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <ActivityIcon className="w-5 h-5" />
            Activity Timeline
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <XIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex gap-2">
            {[
              { value: "all", label: "All Activity" },
              { value: "login", label: "Logins" },
              { value: "message", label: "Messages" },
              { value: "profile_update", label: "Profile Updates" }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === filterOption.value
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoadingActivity ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <ActivityIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No activity found</h3>
              <p className="text-slate-400">No activity matches your current filter</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < filteredActivities.length - 1 && (
                      <div className="w-px h-6 bg-slate-600 mt-2"></div>
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-200">{activity.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">{activity.description}</p>
                        
                        {/* Additional info for login activities */}
                        {activity.type === "login" && (activity.location || activity.ip) && (
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            {activity.location && (
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3" />
                                {activity.location}
                              </div>
                            )}
                            {activity.ip && (
                              <div className="flex items-center gap-1">
                                <span>IP: {activity.ip}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <ClockIcon className="w-3 h-3" />
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex justify-between items-center">
          <div className="text-sm text-slate-400">
            Showing {filteredActivities.length} of {activities.length} activities
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileActivityTimeline;