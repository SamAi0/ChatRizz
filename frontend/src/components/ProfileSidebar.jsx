import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore"; // Import useChatStore
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Icons
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  LinkIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  XIcon,
  ImageIcon,
  FileIcon,
  DownloadIcon,
  EyeIcon,
} from "lucide-react";

const ProfileSidebar = ({ isOpen, onClose, userId }) => {
  const { authUser } = useAuthStore();
  const { getUserMedia, userMedia, isMediaLoading } = useChatStore(); // Get media functions and state
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || !isOpen) return;
      
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(`/profile/${userId}`);
        setProfile(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isOpen]);

  // Fetch user media when the media tab is selected
  useEffect(() => {
    if (activeTab === "media" && profile && isOpen) {
      getUserMedia();
    }
  }, [activeTab, profile, isOpen, getUserMedia]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age > 0 ? age : null;
  };

  if (!isOpen) return null;

  // Function to determine if a media item is an image
  const isImage = (mediaItem) => {
    return mediaItem.type === "image" || 
           (mediaItem.fileType && mediaItem.fileType.startsWith("image/"));
  };

  // Function to determine if a media item is a file
  const isFile = (mediaItem) => {
    return mediaItem.type === "file" || 
           (mediaItem.fileType && !mediaItem.fileType.startsWith("image/"));
  };

  // Function to get file extension
  const getFileExtension = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop().toUpperCase();
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div 
        className="absolute right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200">Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        ) : profile ? (
          <>
            {/* Profile Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  {profile.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">{profile.fullName}</h3>
                  <p className="text-sm text-slate-400">{profile.isOnline ? "Online" : "Offline"}</p>
                </div>
              </div>
              
              {profile.badges && profile.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.badges.map((badge, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded-full text-xs"
                    >
                      {badge.type === "verified" && <span className="text-blue-400">✓</span>}
                      {badge.type === "premium" && <span className="text-yellow-400">★</span>}
                      {badge.type === "influencer" && <span className="text-purple-400">⭐</span>}
                      {badge.type === "developer" && <span className="text-green-400">💻</span>}
                      <span className="text-slate-300">{badge.label}</span>
                    </div>
                  ))}
                </div>
              )}
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
                    {isMediaLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                      </div>
                    ) : userMedia && userMedia.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {userMedia
                          .filter(media => isImage(media))
                          .map((mediaItem) => (
                            <div 
                              key={mediaItem.id} 
                              className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer"
                              onClick={() => window.open(mediaItem.url, '_blank')}
                            >
                              <img
                                src={mediaItem.url}
                                alt="Shared media"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <EyeIcon className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-slate-400">
                        No media shared yet
                      </div>
                    )}
                  </div>
                  
                  {/* Files Shared */}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Files</h3>
                    {isMediaLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                      </div>
                    ) : userMedia && userMedia.length > 0 ? (
                      <div className="space-y-2">
                        {userMedia
                          .filter(media => isFile(media))
                          .map((mediaItem) => (
                            <div 
                              key={mediaItem.id} 
                              className="flex items-center gap-3 p-2 bg-slate-600/50 rounded-lg hover:bg-slate-600 transition-colors"
                            >
                              <div className="w-10 h-10 rounded bg-slate-500 flex items-center justify-center">
                                <FileIcon className="w-5 h-5 text-slate-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-slate-200 truncate">
                                  {mediaItem.caption || `File.${getFileExtension(mediaItem.url)}`}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {mediaItem.fileType ? mediaItem.fileType.split("/")[1]?.toUpperCase() : "FILE"}
                                </div>
                              </div>
                              <a 
                                href={mediaItem.url} 
                                download
                                className="p-2 hover:bg-slate-500 rounded-lg transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DownloadIcon className="w-4 h-4 text-slate-300" />
                              </a>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-slate-400">
                        No files shared yet
                      </div>
                    )}
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
                        {profile.education?.degree && (
                          <div>
                            <div className="text-xs text-slate-400">Degree</div>
                            <div className="text-sm text-slate-200">{profile.education.degree}</div>
                          </div>
                        )}
                        {profile.education?.institution && (
                          <div>
                            <div className="text-xs text-slate-400">Institution</div>
                            <div className="text-sm text-slate-200">{profile.education.institution}</div>
                          </div>
                        )}
                        {profile.education?.fieldOfStudy && (
                          <div>
                            <div className="text-xs text-slate-400">Field of Study</div>
                            <div className="text-sm text-slate-200">{profile.education.fieldOfStudy}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* About */}
                  {profile.about && (
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-300 mb-3">About</h3>
                      <p className="text-sm text-slate-300">{profile.about}</p>
                    </div>
                  )}
                  
                  {/* Member Since */}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-400">Member Since</div>
                        <div className="text-sm text-slate-200">{formatDate(profile.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-slate-400">Failed to load profile</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSidebar;