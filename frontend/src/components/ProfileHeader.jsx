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

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const { getProfile } = useProfileStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [statusText, setStatusText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Dispatch event to open profile sidebar for current user
  const openProfileSidebar = () => {
    window.dispatchEvent(new CustomEvent('openProfileSidebar', { detail: { userId: null } }));
  };

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
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
                  className="cursor-pointer flex items-center gap-2" 
                  onClick={openProfileSidebar}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-slate-200 font-medium text-base max-w-[180px] truncate hover:text-cyan-400 transition-colors">
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
                    <div className="flex items-center gap-2">
                      {/* Custom Status Emoji */}
                      {authUser.customStatus?.emoji && (
                        <span className="text-sm">{authUser.customStatus.emoji}</span>
                      )}
                      <p className="text-slate-400 text-xs truncate max-w-[200px]">
                        {authUser.customStatus?.text || authUser.statusText || "Available"}
                      </p>
                    </div>
                    {/* Online Status */}
                    <p className="text-slate-500 text-xs">Online</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2 items-center">
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors text-xs"
            onClick={() => setEditing((v) => !v)}
            title="Quick Edit"
          >
            Edit
          </button>
          
          {/* Quick Action Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="text-slate-400 hover:text-slate-200 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
              title="More Options"
            >
              <StarIcon className="size-5" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg border border-slate-700 shadow-lg z-50">
                {/* Removed the "View Profile" option that navigates to the profile page */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-t-lg flex items-center gap-2"
                >
                  <PaletteIcon className="w-4 h-4" />
                  {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                </button>
                <button
                  onClick={() => {
                    console.log("Advanced Editor clicked from header");
                    // TODO: Open Advanced Editor
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <StarIcon className="w-4 h-4" />
                  Advanced Edit
                </button>
                <button
                  onClick={() => {
                    console.log("Theme Customizer clicked from header");
                    // TODO: Open Theme Customizer
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <PaletteIcon className="w-4 h-4" />
                  Customize Theme
                </button>
                <button
                  onClick={() => {
                    console.log("Gallery clicked from header");
                    // TODO: Open Gallery
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Gallery
                </button>
                <button
                  onClick={() => {
                    console.log("Activity clicked from header");
                    // TODO: Open Activity Timeline
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

          {/* SOUND TOGGLE BTN */}
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={() => {
              // play click sound before toggling
              mouseClickSound.currentTime = 0; // reset to start
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));
              toggleSound();
            }}
            title={isSoundEnabled ? "Disable Sound" : "Enable Sound"}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;