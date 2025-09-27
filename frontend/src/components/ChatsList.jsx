import { useEffect, useMemo, useState } from "react";
import { UserIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  const filtered = useMemo(
    () =>
      chats.filter((c) => c.fullName.toLowerCase().includes(query.trim().toLowerCase())),
    [chats, query]
  );

  const handleProfileClick = (e, chatId) => {
    e.stopPropagation();
    // Dispatch event to open profile sidebar
    window.dispatchEvent(new CustomEvent('openProfileSidebar', { detail: { userId: chatId } }));
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      <div className="p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats..."
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-3 text-sm"
        />
      </div>
      {filtered.map((chat) => (
        <div
          key={chat._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors relative group"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
              {chat.statusText && (
                <p className="text-slate-400 text-sm truncate">{chat.statusText}</p>
              )}
              {/* Show online status */}
              <p className="text-slate-500 text-xs">
                {onlineUsers.includes(chat._id) ? "Online" : "Offline"}
              </p>
            </div>
            
            {/* Profile View Button */}
            <button
              onClick={(e) => handleProfileClick(e, chat._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="View Profile"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;