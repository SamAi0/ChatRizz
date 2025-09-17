import { XIcon, UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
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
    <div
      className="flex justify-between items-center bg-slate-800/50 border-b
   border-slate-700/50 max-h-[84px] px-6 flex-1"
    >
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/profile/${selectedUser._id}`)}>
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
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(`/profile/${selectedUser._id}`)}
          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
          title="View Profile"
        >
          <UserIcon className="w-4 h-4 text-slate-400 hover:text-slate-200" />
        </button>
        
        <button onClick={() => setSelectedUser(null)}>
          <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
