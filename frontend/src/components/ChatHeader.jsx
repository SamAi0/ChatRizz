import { XIcon, UserIcon, Languages, Settings, LogOutIcon, Trash2Icon, RotateCcwIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import TranslationSettings from "./TranslationSettings";
import { useTranslationStore } from "../store/useTranslationStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function ChatHeader() {
  const { selectedUser, setSelectedUser, getMyChatPartners, getMessagesByUserId } = useChatStore();
  const { onlineUsers, socket, logout: authLogout } = useAuthStore();
  const { preferredLanguage, supportedLanguages, autoTranslate } = useTranslationStore();
  const navigate = useNavigate();
  const [isTyping, setIsTyping] = useState(false);
  const [showTranslationSettings, setShowTranslationSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isClearingChat, setIsClearingChat] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const dropdownRef = useRef(null);
  const isOnline = onlineUsers.includes(selectedUser._id);

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

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  useEffect(() => {
    if (!socket) return;
    const onTyping = ({ from }) => {
      if (from === selectedUser._id) setIsTyping(true);
    };
    const onStopTyping = ({ from }) => {
      if (from === selectedUser._id) setIsTyping(false);
    };
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);
    const timeout = setInterval(() => setIsTyping(false), 4000);
    return () => {
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
      clearInterval(timeout);
    };
  }, [socket, selectedUser]);

  const handleLogout = async () => {
    try {
      await authLogout();
      setShowDropdown(false);
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleClearChat = async () => {
    if (!selectedUser) return;
    
    if (!window.confirm("Are you sure you want to clear all messages in this chat? This cannot be undone.")) {
      setShowDropdown(false);
      return;
    }

    setIsClearingChat(true);
    try {
      // Clear all messages in the chat
      await axiosInstance.delete(`/messages/clear/${selectedUser._id}`);
      await getMessagesByUserId(selectedUser._id);
      toast.success("Chat cleared successfully");
    } catch (error) {
      toast.error("Failed to clear chat");
      console.error("Clear chat error:", error);
    } finally {
      setIsClearingChat(false);
      setShowDropdown(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedUser) return;
    
    if (!window.confirm("Are you sure you want to delete this chat? This will remove it from your chat list.")) {
      setShowDropdown(false);
      return;
    }

    setIsDeletingChat(true);
    try {
      // Delete all messages and remove chat from list
      await axiosInstance.delete(`/messages/delete/${selectedUser._id}`);
      await getMyChatPartners();
      setSelectedUser(null); // Close the chat
      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error("Failed to delete chat");
      console.error("Delete chat error:", error);
    } finally {
      setIsDeletingChat(false);
      setShowDropdown(false);
    }
  };

  // Dispatch event to open profile sidebar
  const openProfileSidebar = () => {
    window.dispatchEvent(new CustomEvent('openProfileSidebar', { detail: { userId: selectedUser._id } }));
  };

  return (
    <>
      <div
        className="flex justify-between items-center bg-slate-800/50 border-b
     border-slate-700/50 max-h-[84px] px-6 flex-1"
      >
        <div className="flex items-center space-x-3 cursor-pointer" onClick={openProfileSidebar}>
          <div className={`avatar ${isOnline ? "online" : "offline"}`}>
            <div className="w-12 rounded-full">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          <div>
            <h3 className="text-slate-200 font-medium hover:text-cyan-400 transition-colors">{selectedUser.fullName}</h3>
            <p className="text-slate-400 text-sm">
              {isTyping ? "typing…" : isOnline ? "Online" : "Offline"}
            </p>
            {selectedUser.statusText && (
              <p className="text-slate-500 text-xs truncate max-w-[200px]">{selectedUser.statusText}</p>
            )}
            {autoTranslate && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-green-400 text-xs font-medium">Auto-translate: ON</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowTranslationSettings(true)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            title="Translation Settings"
          >
            <Languages className="w-4 h-4 text-slate-400 hover:text-slate-200" />
          </button>
          
          <button 
            onClick={openProfileSidebar}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            title="View Profile"
          >
            <UserIcon className="w-4 h-4 text-slate-400 hover:text-slate-200" />
          </button>
          
          {/* 3-dot menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
              title="More Options"
            >
              <Settings className="w-4 h-4 text-slate-400 hover:text-slate-200" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg border border-slate-700 shadow-lg z-50">
                {/* Removed the "View Profile" option that navigates to the profile page */}
                
                {selectedUser && (
                  <>
                    <button
                      onClick={handleClearChat}
                      disabled={isClearingChat}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 rounded-t-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      <RotateCcwIcon className="w-4 h-4" />
                      {isClearingChat ? "Clearing..." : "Clear Chat"}
                    </button>
                    
                    <button
                      onClick={handleDeleteChat}
                      disabled={isDeletingChat}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2Icon className="w-4 h-4" />
                      {isDeletingChat ? "Deleting..." : "Delete Chat"}
                    </button>
                  </>
                )}
                
                <hr className="border-slate-700" />
                <button
                  onClick={() => {
                    navigate("/profile/settings");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
          
          <button onClick={() => setSelectedUser(null)}>
            <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Translation Settings Modal */}
      {showTranslationSettings && (
        <TranslationSettings onClose={() => setShowTranslationSettings(false)} />
      )}
    </>
  );
}
export default ChatHeader;