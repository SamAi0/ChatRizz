import { XIcon, UserIcon, ShieldCheckIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, openProfileSidebar } = useChatStore();
  const { onlineUsers, socket } = useAuthStore();
  const navigate = useNavigate();
  const [isTyping, setIsTyping] = useState(false);
  const isOnline = onlineUsers.includes(selectedUser._id);

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

  return (
    <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 px-6 py-4">
      {/* User Info Section - Clickable */}
      <div 
        className="flex items-center space-x-3 cursor-pointer group flex-1"
        onClick={() => openProfileSidebar(selectedUser)}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600 group-hover:border-cyan-500 transition-colors">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Online Status */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${
            isOnline ? "bg-green-500" : "bg-slate-500"
          }`} />
        </div>
        
        {/* User Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-slate-200 font-medium group-hover:text-cyan-400 transition-colors truncate">
              {selectedUser.fullName}
            </h3>
            {/* Verification Badge */}
            {selectedUser.verification?.isVerified && (
              <ShieldCheckIcon className="w-4 h-4 text-cyan-400" title="Verified User" />
            )}
          </div>
          
          <p className="text-slate-400 text-sm">
            {isTyping ? (
              <span className="flex items-center gap-1">
                <span className="animate-pulse">📝</span>
                typing...
              </span>
            ) : (
              <span className={isOnline ? "text-green-400" : "text-slate-500"}>
                {isOnline ? "Online" : "Last seen recently"}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Profile Details Button */}
        <button 
          onClick={() => openProfileSidebar(selectedUser)}
          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group"
          title="View Profile Details"
        >
          <UserIcon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </button>
        
        {/* Close Chat Button */}
        <button 
          onClick={() => setSelectedUser(null)}
          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group"
          title="Close Chat"
        >
          <XIcon className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
