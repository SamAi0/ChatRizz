import { useState, useEffect } from "react";
import { 
  XIcon, 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  CalendarIcon,
  MapPinIcon,
  BriefcaseIcon,
  GlobeIcon,
  HeartIcon,
  StarIcon,
  CameraIcon,
  MessageSquareIcon,
  ShieldIcon,
  FlagIcon,
  MoreHorizontalIcon,
  ShieldCheckIcon,
  CrownIcon,
  EditIcon,
  ImageIcon,
  ActivityIcon,
  BellIcon,
  SettingsIcon
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";

function UserProfileSidebar({ isOpen, onClose, user }) {
  const { authUser } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const [activeTab, setActiveTab] = useState("info");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Close sidebar when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
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

  if (!isOpen || !user) return null;

  const isOwnProfile = authUser && authUser._id === user._id;

  const handleStartChat = () => {
    setSelectedUser(user);
    onClose();
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleToggleBlock = () => {
    setIsBlocked(!isBlocked);
    toast.success(isBlocked ? "User unblocked" : "User blocked");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Never";
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now - lastSeenDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const tabs = [
    { id: "info", label: "Info", icon: UserIcon },
    { id: "media", label: "Media", icon: ImageIcon },
    { id: "activity", label: "Activity", icon: ActivityIcon },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full w-80 bg-slate-800/95 backdrop-blur-sm 
        border-l border-slate-700/50 z-50 transform transition-transform duration-300
        lg:relative lg:transform-none lg:z-auto
        flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-200">Profile Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
          >
            <XIcon className="w-5 h-5 text-slate-200" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="p-6 text-center border-b border-slate-700/50">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 border-4 border-slate-600">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Online Status Indicator */}
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
              <div className={`w-4 h-4 rounded-full ${
                user.isOnline ? "bg-green-500" : "bg-slate-500"
              }`} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-xl font-semibold text-slate-200">{user.fullName}</h3>
              {/* Verification Badges */}
              {user.verification?.isVerified && (
                <ShieldCheckIcon className="w-5 h-5 text-cyan-400" title="Verified User" />
              )}
              {user.verification?.badges?.some(badge => badge.type === 'professional') && (
                <CrownIcon className="w-5 h-5 text-yellow-400" title="Professional" />
              )}
            </div>
            
            <p className="text-slate-400 text-sm">
              {user.customStatus?.text || user.statusText || "Available"}
            </p>
            
            <p className="text-slate-500 text-xs">
              Last seen {formatLastSeen(user.lastSeen)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {!isOwnProfile && (
              <>
                <button
                  onClick={handleStartChat}
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquareIcon className="w-4 h-4" />
                  Message
                </button>
                
                <button
                  onClick={handleToggleFavorite}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                    isFavorite 
                      ? "bg-pink-600 text-white hover:bg-pink-700" 
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  <HeartIcon className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
                
                <div className="relative group">
                  <button className="px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
                    <MoreHorizontalIcon className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 rounded-lg border border-slate-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={handleToggleBlock}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
                    >
                      <ShieldIcon className="w-4 h-4" />
                      {isBlocked ? "Unblock" : "Block"} User
                    </button>
                    <button className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                      <FlagIcon className="w-4 h-4" />
                      Report User
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
                <EditIcon className="w-4 h-4" />
                Edit Profile
              </button>
            )}
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
                  activeTab === tab.id
                    ? "text-cyan-400 border-b-2 border-cyan-400 bg-slate-700/30"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "info" && (
            <div className="space-y-4">
              {/* Basic Info */}
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

                {user.location && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-slate-200 text-sm">{user.location}</p>
                      <p className="text-slate-500 text-xs">Location</p>
                    </div>
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

              {/* Professional Info */}
              {(user.jobTitle || user.company) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Professional</h4>
                  
                  {user.jobTitle && (
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-slate-200 text-sm">{user.jobTitle}</p>
                        <p className="text-slate-500 text-xs">Job Title</p>
                      </div>
                    </div>
                  )}

                  {user.company && (
                    <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-slate-200 text-sm">{user.company}</p>
                        <p className="text-slate-500 text-xs">Company</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Social Links */}
              {user.socialMedia && Object.values(user.socialMedia).some(link => link) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Social Links</h4>
                  
                  {Object.entries(user.socialMedia).map(([platform, url]) => {
                    if (!url) return null;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        <GlobeIcon className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-slate-200 text-sm capitalize">{platform}</p>
                          <p className="text-slate-500 text-xs">{url}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Shared Media</h4>
                <span className="text-xs text-slate-500">12 items</span>
              </div>
              
              {/* Media Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                  <div
                    key={item}
                    className="aspect-square bg-slate-700/50 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {}}
                  >
                    <img
                      src={`https://picsum.photos/100/100?random=${item}`}
                      alt={`Media ${item}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              
              {/* Media Categories */}
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-slate-200 text-sm font-medium">Photos</p>
                      <p className="text-slate-500 text-xs">8 items</p>
                    </div>
                  </div>
                  <span className="text-slate-400">›</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-green-400">🎬</span>
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm font-medium">Videos</p>
                      <p className="text-slate-500 text-xs">3 items</p>
                    </div>
                  </div>
                  <span className="text-slate-400">›</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-purple-400">📎</span>
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm font-medium">Files</p>
                      <p className="text-slate-500 text-xs">1 item</p>
                    </div>
                  </div>
                  <span className="text-slate-400">›</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-slate-300 uppercase tracking-wide">Recent Activity</h4>
              
              {/* Activity Timeline */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 text-sm">Online now</p>
                    <p className="text-slate-500 text-xs">Active in chat</p>
                  </div>
                  <span className="text-slate-500 text-xs">now</span>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 text-sm">Shared a photo</p>
                    <p className="text-slate-500 text-xs">In your conversation</p>
                  </div>
                  <span className="text-slate-500 text-xs">2h ago</span>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 text-sm">Profile updated</p>
                    <p className="text-slate-500 text-xs">Added new bio</p>
                  </div>
                  <span className="text-slate-500 text-xs">1d ago</span>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 text-sm">Joined ChatRizz</p>
                    <p className="text-slate-500 text-xs">Welcome to the community!</p>
                  </div>
                  <span className="text-slate-500 text-xs">{formatDate(user.createdAt)}</span>
                </div>
              </div>
              
              {/* Activity Stats */}
              <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
                <h5 className="text-slate-300 font-medium mb-3">Activity Stats</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-cyan-400">142</p>
                    <p className="text-slate-500 text-xs">Messages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-400">28</p>
                    <p className="text-slate-500 text-xs">Media Shared</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-purple-400">5</p>
                    <p className="text-slate-500 text-xs">Days Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-yellow-400">92%</p>
                    <p className="text-slate-500 text-xs">Response Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserProfileSidebar;