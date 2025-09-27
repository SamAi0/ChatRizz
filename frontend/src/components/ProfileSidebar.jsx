import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  XIcon, 
  MailIcon, 
  MapPinIcon, 
  CalendarIcon, 
  LinkIcon, 
  PhoneIcon, 
  UserIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  CrownIcon,
  StarIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  LanguagesIcon,
  HeartIcon,
  GlobeIcon,
  BadgeIcon,
  ImageIcon,
  FileIcon,
  Volume2Icon,
  VolumeXIcon,
  BanIcon,
  MoreHorizontalIcon,
  ClockIcon
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useProfileStore } from "../store/useProfileStore";
import { useChatStore } from "../store/useChatStore";

const ProfileSidebar = ({ isOpen, onClose, userId }) => {
  const navigate = useNavigate();
  const { authUser, onlineUsers } = useAuthStore();
  const { profile, isLoadingProfile, getProfile } = useProfileStore();
  const { setSelectedUser } = useChatStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const isOwnProfile = !userId || userId === "me" || userId === authUser?._id;
  const isOnline = profile ? onlineUsers.includes(profile._id) : false;

  useEffect(() => {
    if (isOpen && userId) {
      getProfile(userId);
    } else if (isOpen && !userId) {
      // Show current user's profile
      getProfile("me");
    }
  }, [isOpen, userId, getProfile]);

  const handleStartChat = () => {
    if (profile) {
      setSelectedUser(profile);
      onClose();
      navigate("/");
    }
  };

  const handleMuteToggle = () => {
    // TODO: Implement mute functionality
    setIsMuted(!isMuted);
    console.log(`${isMuted ? "Unmuted" : "Muted"} user:`, profile?.fullName);
  };

  const handleBlockToggle = () => {
    // TODO: Implement block functionality
    setIsBlocked(!isBlocked);
    console.log(`${isBlocked ? "Unblocked" : "Blocked"} user:`, profile?.fullName);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "last seen just now";
    } else if (diffInHours < 24) {
      return `last seen ${diffInHours} hours ago`;
    } else {
      return `last seen ${Math.floor(diffInHours / 24)} days ago`;
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200">
              {isOwnProfile ? "My Profile" : `${profile?.fullName || "Profile"}`}
            </h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-700 transition-colors"
            >
              <XIcon className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          {isLoadingProfile ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : profile ? (
            <>
              {/* Profile Header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700">
                      <img
                        src={profile.profilePic || "/avatar.png"}
                        alt={profile.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {profile.verification?.isVerified && (
                      <div className="absolute bottom-0 right-0 bg-cyan-500 rounded-full p-1">
                        <ShieldCheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-slate-200">{profile.fullName}</h3>
                  <p className="text-slate-400 text-sm mt-1">{profile.statusText || "Available"}</p>
                  
                  {/* Online Status / Last Seen */}
                  {!isOwnProfile && (
                    <p className="text-slate-500 text-xs mt-1">
                      {isOnline ? "online" : profile.lastSeen ? formatLastSeen(profile.lastSeen) : "last seen recently"}
                    </p>
                  )}
                  
                  {profile.bio && (
                    <p className="text-slate-300 text-sm mt-2 text-center">{profile.bio}</p>
                  )}
                  
                  {/* Verification Badges */}
                  {profile.verification?.badges?.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {profile.verification.badges.map((badge, index) => (
                        <div key={index} className="bg-slate-700 rounded-full p-1" title={badge.description}>
                          {badge.type === "verified" && <ShieldCheckIcon className="w-4 h-4 text-cyan-400" />}
                          {badge.type === "professional" && <BriefcaseIcon className="w-4 h-4 text-blue-400" />}
                          {badge.type === "influencer" && <StarIcon className="w-4 h-4 text-yellow-400" />}
                          {badge.type === "developer" && <GlobeIcon className="w-4 h-4 text-green-400" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-slate-700">
                <button
                  className={`flex-1 py-3 text-center text-sm font-medium ${
                    activeTab === "profile" 
                      ? "text-cyan-400 border-b-2 border-cyan-400" 
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                  onClick={() => setActiveTab("profile")}
                >
                  Profile
                </button>
                <button
                  className={`flex-1 py-3 text-center text-sm font-medium ${
                    activeTab === "media" 
                      ? "text-cyan-400 border-b-2 border-cyan-400" 
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                  onClick={() => setActiveTab("media")}
                >
                  Media
                </button>
                <button
                  className={`flex-1 py-3 text-center text-sm font-medium ${
                    activeTab === "details" 
                      ? "text-cyan-400 border-b-2 border-cyan-400" 
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  Details
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "profile" ? (
                  <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-300 mb-3">Contact Info</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <MailIcon className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-xs text-slate-400">Email</div>
                            <div className="text-sm text-slate-200">{profile.email}</div>
                          </div>
                        </div>
                        
                        {profile.phone && (
                          <div className="flex items-center gap-3">
                            <PhoneIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-400">Phone</div>
                              <div className="text-sm text-slate-200">{profile.phone}</div>
                            </div>
                          </div>
                        )}
                        
                        {profile.location && (
                          <div className="flex items-center gap-3">
                            <MapPinIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-400">Location</div>
                              <div className="text-sm text-slate-200">{profile.location}</div>
                            </div>
                          </div>
                        )}
                        
                        {profile.website && (
                          <div className="flex items-center gap-3">
                            <LinkIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-400">Website</div>
                              <a 
                                href={profile.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-cyan-400 hover:text-cyan-300"
                              >
                                {profile.website}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Personal Info */}
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-300 mb-3">Personal Info</h3>
                      <div className="space-y-3">
                        {profile.dateOfBirth && (
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-400">Date of Birth</div>
                              <div className="text-sm text-slate-200">
                                {formatDate(profile.dateOfBirth)}
                                {calculateAge(profile.dateOfBirth) && (
                                  <span className="text-slate-400 ml-2">
                                    (Age: {calculateAge(profile.dateOfBirth)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-xs text-slate-400">Member Since</div>
                            <div className="text-sm text-slate-200">{formatDate(profile.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === "media" ? (
                  <div className="space-y-4">
                    {/* Media Shared */}
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-300 mb-3">Media</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {/* Placeholder for media items */}
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                          <div key={item} className="aspect-square bg-slate-600 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Files Shared */}
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-300 mb-3">Files</h3>
                      <div className="space-y-2">
                        {/* Placeholder for file items */}
                        {[1, 2].map((item) => (
                          <div key={item} className="flex items-center gap-3 p-2 bg-slate-600/50 rounded-lg">
                            <FileIcon className="w-5 h-5 text-slate-400" />
                            <div className="flex-1">
                              <div className="text-sm text-slate-200">document.pdf</div>
                              <div className="text-xs text-slate-400">2.4 MB</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Professional Info */}
                    {(profile.jobTitle || profile.company || profile.industry) && (
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                          <BriefcaseIcon className="w-4 h-4" />
                          Professional Info
                        </h3>
                        <div className="space-y-2">
                          {profile.jobTitle && (
                            <div>
                              <div className="text-xs text-slate-400">Job Title</div>
                              <div className="text-sm text-slate-200">{profile.jobTitle}</div>
                            </div>
                          )}
                          {profile.company && (
                            <div>
                              <div className="text-xs text-slate-400">Company</div>
                              <div className="text-sm text-slate-200">{profile.company}</div>
                            </div>
                          )}
                          {profile.industry && (
                            <div>
                              <div className="text-xs text-slate-400">Industry</div>
                              <div className="text-sm text-slate-200">{profile.industry}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Education */}
                    {(profile.education?.degree || profile.education?.institution) && (
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                          <GraduationCapIcon className="w-4 h-4" />
                          Education
                        </h3>
                        <div className="space-y-2">
                          {profile.education.degree && (
                            <div>
                              <div className="text-xs text-slate-400">Degree</div>
                              <div className="text-sm text-slate-200">{profile.education.degree}</div>
                            </div>
                          )}
                          {profile.education.institution && (
                            <div>
                              <div className="text-xs text-slate-400">Institution</div>
                              <div className="text-sm text-slate-200">{profile.education.institution}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Skills */}
                    {profile.skills?.length > 0 && (
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-slate-600 text-slate-200 text-xs rounded-full"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Languages */}
                    {profile.languages?.length > 0 && (
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                          <LanguagesIcon className="w-4 h-4" />
                          Languages
                        </h3>
                        <div className="space-y-2">
                          {profile.languages.map((language, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-sm text-slate-200">{language.name}</span>
                              <span className="text-xs text-slate-400">{language.proficiency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-700 space-y-2">
                {!isOwnProfile ? (
                  <>
                    <button
                      onClick={handleStartChat}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                      <MessageCircleIcon className="w-4 h-4" />
                      Message
                    </button>
                    
                    {/* Mute/Unmute Button */}
                    <button
                      onClick={handleMuteToggle}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      {isMuted ? (
                        <>
                          <Volume2Icon className="w-4 h-4" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <VolumeXIcon className="w-4 h-4" />
                          Mute
                        </>
                      )}
                    </button>
                    
                    {/* Block/Unblock Button */}
                    <button
                      onClick={handleBlockToggle}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                        isBlocked 
                          ? "bg-green-600 hover:bg-green-700 text-white" 
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                    >
                      <BanIcon className="w-4 h-4" />
                      {isBlocked ? "Unblock" : "Block"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/profile");
                      onClose();
                    }}
                    className="w-full py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400">Profile not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;