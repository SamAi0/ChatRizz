import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOutIcon, 
  VolumeOffIcon, 
  Volume2Icon, 
  SettingsIcon, 
  UserIcon, 
  PaletteIcon, 
  StarIcon, 
  CrownIcon, 
  ShieldCheckIcon, 
  ActivityIcon,
  ImageIcon
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useProfileStore } from "../store/useProfileStore";
import { useThemeStore } from "../store/useThemeStore";
import SimpleProfileEditor from "./SimpleProfileEditor";
import ProfileThemeCustomizer from "./ProfileThemeCustomizer";
import ProfileGalleryManager from "./ProfileGalleryManager";
import ProfileActivityTimeline from "./ProfileActivityTimeline";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound, openProfileSidebar } = useChatStore();
  const { getProfile } = useProfileStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [statusText, setStatusText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSimpleEditor, setShowSimpleEditor] = useState(false);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showGalleryManager, setShowGalleryManager] = useState(false);
  const [showActivityTimeline, setShowActivityTimeline] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const submitProfile = async () => {
    await updateProfile({ fullName: name || authUser.fullName, statusText });
    setEditing(false);
  };

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="relative">
            <button
              className="size-14 rounded-full overflow-hidden relative group border-2 border-green-500 hover:border-green-400 transition-colors"
              onClick={() => openProfileSidebar(authUser)}
              title="View My Profile"
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Your profile"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              
              {/* Online Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </button>
            
            {/* Secondary Action - Change Photo */}
            <button
              className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center hover:bg-cyan-700 transition-colors shadow-lg"
              onClick={() => fileInputRef.current.click()}
              title="Change Photo"
            >
              <ImageIcon className="w-3 h-3 text-white" />
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & AVAILABILITY STATUS */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-1">
                <input
                  className="bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-sm w-48"
                  defaultValue={authUser.fullName}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-xs w-48"
                  placeholder="Status (e.g., Available)"
                  defaultValue={authUser.statusText || "Available"}
                  onChange={(e) => setStatusText(e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="text-xs text-cyan-400" onClick={submitProfile}>Save</button>
                  <button className="text-xs text-slate-400" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div 
                  className="cursor-pointer group" 
                  onClick={() => openProfileSidebar(authUser)}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-200 font-medium text-base max-w-[160px] truncate group-hover:text-cyan-400 transition-colors">
                      {authUser.fullName}
                    </h3>
                    {/* Verification Badge */}
                    {authUser.verification?.isVerified && (
                      <ShieldCheckIcon className="w-4 h-4 text-cyan-400" title="Verified User" />
                    )}
                    {/* Premium Badge */}
                    {authUser.verification?.badges?.some(badge => badge.type === 'professional') && (
                      <CrownIcon className="w-4 h-4 text-yellow-400" title="Professional" />
                    )}
                  </div>
                  
                  {/* Availability Status */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-green-400 text-xs font-medium">Online</span>
                    </div>
                    
                    {/* Custom Status */}
                    <div className="flex items-center gap-1">
                      {authUser.customStatus?.emoji && (
                        <span className="text-xs">{authUser.customStatus.emoji}</span>
                      )}
                      <p className="text-slate-400 text-xs truncate max-w-[140px]">
                        {authUser.customStatus?.text || authUser.statusText || "Available"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-1 items-center">
          {/* Quick Edit Button */}
          <button
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            onClick={() => setEditing((v) => !v)}
            title="Quick Edit"
          >
            <span className="text-xs">✏️</span>
          </button>
          
          {/* 3-Dot Menu for Secondary Actions */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
              title="More Options"
            >
              <span className="text-base">⋯</span>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg border border-slate-700 shadow-lg z-50">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <PaletteIcon className="w-4 h-4" />
                  {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                </button>
                <button
                  onClick={() => {
                    setShowSimpleEditor(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <StarIcon className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setShowThemeCustomizer(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <PaletteIcon className="w-4 h-4" />
                  Customize Theme
                </button>
                <button
                  onClick={() => {
                    setShowGalleryManager(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Gallery
                </button>
                <button
                  onClick={() => {
                    setShowActivityTimeline(true);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <ActivityIcon className="w-4 h-4" />
                  Activity
                </button>
                <hr className="border-slate-700" />
                <button
                  onClick={() => {
                    navigate("/profile/settings");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Sound Toggle - Primary Action */}
          <button
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
            title={isSoundEnabled ? "Disable Sound" : "Enable Sound"}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="w-4 h-4" />
            ) : (
              <VolumeOffIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Simple Profile Editor Modal */}
      <SimpleProfileEditor
        isOpen={showSimpleEditor}
        onClose={() => setShowSimpleEditor(false)}
        initialData={authUser}
      />
    
      {/* Theme Customizer Modal */}
      <ProfileThemeCustomizer
        isOpen={showThemeCustomizer}
        onClose={() => setShowThemeCustomizer(false)}
        currentTheme={authUser?.profileTheme}
      />
    
      {/* Gallery Manager Modal */}
      <ProfileGalleryManager
        isOpen={showGalleryManager}
        onClose={() => setShowGalleryManager(false)}
        gallery={authUser?.profileGallery || []}
      />
    
      {/* Activity Timeline Modal */}
      <ProfileActivityTimeline
        isOpen={showActivityTimeline}
        onClose={() => setShowActivityTimeline(false)}
      />
    </div>
  );
}
export default ProfileHeader;
