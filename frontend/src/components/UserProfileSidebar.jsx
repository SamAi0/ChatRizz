import { useState, useEffect } from "react";
import { 
  XIcon, UserIcon, MailIcon, CalendarIcon, MapPinIcon, BriefcaseIcon,
  HeartIcon, MessageSquareIcon, ShieldIcon, FlagIcon, MoreHorizontalIcon,
  ShieldCheckIcon, CrownIcon, EditIcon, ImageIcon, ActivityIcon,
  AwardIcon, ClockIcon, UsersIcon, MessageCircleIcon, PhotoIcon,
  ZapIcon, BarChart3Icon, LoaderIcon
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios";

function UserProfileSidebar({ isOpen, onClose, user }) {
  const { authUser } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [profileStats, setProfileStats] = useState(null);
  const [profileMedia, setProfileMedia] = useState([]);
  const [profileActivity, setProfileActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (user && isOpen) {
      fetchProfileStats();
      if (activeTab === 'media') fetchProfileMedia();
      if (activeTab === 'activity') fetchProfileActivity();
    }
  }, [user, activeTab, isOpen]);

  const fetchProfileStats = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/profile/stats/${user._id}`);
      setProfileStats(response.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load profile statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileMedia = async () => {
    if (!user?._id) return;
    try {
      const response = await axiosInstance.get(`/profile/media/${user._id}`);
      setProfileMedia(response.data.media || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProfileActivity = async () => {
    if (!user?._id) return;
    try {
      const response = await axiosInstance.get(`/profile/activity/${user._id}`);
      setProfileActivity(response.data.activities || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await axiosInstance.post(`/profile/favorite/${user._id}`);
      setIsFavorite(response.data.isFavorited);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleToggleBlock = async () => {
    try {
      const action = isBlocked ? 'unblock' : 'block';
      const response = await axiosInstance.post(`/profile/block/${user._id}`, { action });
      setIsBlocked(response.data.isBlocked);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update block status');
    }
  };

  const handleReportUser = async () => {
    try {
      const reason = prompt("Please provide a reason for reporting this user:");
      if (!reason) return;
      await axiosInstance.post(`/profile/report/${user._id}`, { reason });
      toast.success("User reported successfully");
    } catch (error) {
      toast.error('Failed to report user');
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Never";
    const diff = Date.now() - new Date(lastSeen);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  if (!isOpen || !user) return null;

  const isOwnProfile = authUser && authUser._id === user._id;
  const tabs = [
    { id: "info", label: "Info", icon: UserIcon },
    { id: "skills", label: "Skills", icon: AwardIcon },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "activity", label: "Activity", icon: ActivityIcon },
    { id: "stats", label: "Stats", icon: BarChart3Icon },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      
      <div className={`
        fixed right-0 top-0 h-full w-80 bg-slate-800/95 backdrop-blur-sm 
        border-l border-slate-700/50 z-50 transform transition-transform duration-300
        lg:relative lg:transform-none lg:z-auto flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200">Profile Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
            <XIcon className="w-5 h-5 text-slate-200" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative">
          <div className="h-20 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-800/50"></div>
          </div>
          
          <div className="p-6 text-center border-b border-slate-700/50 -mt-8 relative">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 border-4 border-slate-800 shadow-lg">
                <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-800">
                <div className={`w-4 h-4 rounded-full ${user.isOnline ? "bg-green-500" : "bg-slate-500"}`} />
              </div>
              {user.verification?.isVerified && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                  <ShieldCheckIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl font-semibold text-slate-200">{user.fullName}</h3>
                {user.verification?.badges?.some(badge => badge.type === 'professional') && (
                  <div className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                    <CrownIcon className="w-3 h-3 text-yellow-400" />
                  </div>
                )}
              </div>
              
              <p className="text-slate-400 text-sm">{user.customStatus?.text || user.statusText || "Available"}</p>
              {user.jobTitle && <p className="text-slate-300 text-sm font-medium">{user.jobTitle}</p>}
              
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                <ClockIcon className="w-3 h-3" />
                <span>Last seen {formatLastSeen(user.lastSeen)}</span>
              </div>
              
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-700/30">
                <div className="text-center">
                  <p className="text-slate-200 font-semibold text-sm">{profileStats?.messagesSent || 0}</p>
                  <p className="text-slate-500 text-xs">Messages</p>
                </div>
                <div className="w-px h-6 bg-slate-600"></div>
                <div className="text-center">
                  <p className="text-slate-200 font-semibold text-sm">{profileStats?.contacts || 0}</p>
                  <p className="text-slate-500 text-xs">Contacts</p>
                </div>
                <div className="w-px h-6 bg-slate-600"></div>
                <div className="text-center">
                  <p className="text-slate-200 font-semibold text-sm">{profileStats?.memberDays || 0}d</p>
                  <p className="text-slate-500 text-xs">Active</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              {!isOwnProfile && (
                <>
                  <button
                    onClick={() => { setSelectedUser(user); onClose(); }}
                    className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquareIcon className="w-4 h-4" />Message
                  </button>
                  
                  <button
                    onClick={handleToggleFavorite}
                    className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                      isFavorite ? "bg-pink-600 text-white hover:bg-pink-700" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    <HeartIcon className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                  </button>
                  
                  <div className="relative group">
                    <button className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                      <MoreHorizontalIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-lg border border-slate-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button onClick={handleToggleBlock} className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-t-lg flex items-center gap-2">
                        <ShieldIcon className="w-4 h-4" />{isBlocked ? "Unblock" : "Block"} User
                      </button>
                      <button onClick={handleReportUser} className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                        <FlagIcon className="w-4 h-4" />Report User
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              {isOwnProfile && (
                <button
                  onClick={() => window.location.href = "/profile"}
                  className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <EditIcon className="w-4 h-4" />Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.id ? "text-cyan-400 border-b-2 border-cyan-400 bg-slate-700/30" : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Basic Information</h4>
                
                {user.email && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <MailIcon className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-slate-200 text-sm">{user.email}</p>
                      <p className="text-slate-500 text-xs">Email</p>
                    </div>
                  </div>
                )}

                {user.bio && (
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-slate-200 text-sm">{user.bio}</p>
                    <p className="text-slate-500 text-xs mt-1">Bio</p>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-slate-200 text-sm">{formatDate(user.createdAt)}</p>
                    <p className="text-slate-500 text-xs">Member since</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Statistics</h4>
                {loading && <LoaderIcon className="w-4 h-4 animate-spin text-cyan-400" />}
              </div>
              
              {profileStats && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MessageCircleIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-xl font-bold text-blue-400">{profileStats.messagesSent}</span>
                    </div>
                    <p className="text-slate-500 text-xs">Messages</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <PhotoIcon className="w-4 h-4 text-green-400" />
                      <span className="text-xl font-bold text-green-400">{profileStats.mediaShared}</span>
                    </div>
                    <p className="text-slate-500 text-xs">Media</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <UsersIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-xl font-bold text-purple-400">{profileStats.contacts}</span>
                    </div>
                    <p className="text-slate-500 text-xs">Contacts</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ZapIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-xl font-bold text-yellow-400">{profileStats.responseRate}%</span>
                    </div>
                    <p className="text-slate-500 text-xs">Response</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Shared Media</h4>
              <div className="grid grid-cols-3 gap-2">
                {(profileMedia.length > 0 ? profileMedia : Array.from({length: 6})).slice(0, 9).map((item, index) => (
                  <div key={index} className="aspect-square bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    <img
                      src={item?.image || `https://picsum.photos/100/100?random=${index + 1}`}
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Recent Activity</h4>
              <div className="space-y-4">
                {profileActivity.length > 0 ? (
                  profileActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-200 text-sm">{activity.action?.replace('_', ' ')}</p>
                        <p className="text-slate-500 text-xs">{activity.details || 'Activity logged'}</p>
                      </div>
                      <span className="text-slate-500 text-xs">2h ago</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-200 text-sm">Online now</p>
                      <p className="text-slate-500 text-xs">Active in chat</p>
                    </div>
                    <span className="text-slate-500 text-xs">now</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Skills & Expertise</h4>
              {user.skills && user.skills.length > 0 ? (
                <div className="space-y-2">
                  {user.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AwardIcon className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-slate-200 text-sm font-medium">{skill.name}</p>
                          <p className="text-slate-500 text-xs capitalize">{skill.level}</p>
                        </div>
                      </div>
                      {skill.verified && <ShieldCheckIcon className="w-4 h-4 text-green-400" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <p className="text-slate-400 text-sm">No skills added yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserProfileSidebar;