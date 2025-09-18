import { useEffect, useMemo, useState } from "react";
import { UserIcon, MessageSquareIcon, ShieldCheckIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, openProfileSidebar } = useChatStore();
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

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      <div className="px-3 py-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats..."
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2.5 px-4 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
        />
      </div>
      {filtered.map((chat) => (
        <div
          key={chat._id}
          className="bg-slate-800/30 hover:bg-slate-800/50 p-3 rounded-lg cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-700/50"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            {/* Clickable Avatar */}
            <button
              className={`relative rounded-full overflow-hidden border-2 transition-all duration-200 ${
                onlineUsers.includes(chat._id) 
                  ? "border-green-500 shadow-green-500/20 shadow-md" 
                  : "border-slate-600"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                openProfileSidebar(chat);
              }}
              title="View Profile"
            >
              <div className="size-12">
                <img 
                  src={chat.profilePic || "/avatar.png"} 
                  alt={chat.fullName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Online Status Badge */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${
                onlineUsers.includes(chat._id) ? "bg-green-500" : "bg-slate-500"
              }`} />
            </button>
            
            {/* Chat Info - Clickable */}
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openProfileSidebar(chat);
              }}
            >
              <div className="flex items-center gap-2">
                <h4 className="text-slate-200 font-medium truncate group-hover:text-cyan-400 transition-colors">
                  {chat.fullName}
                </h4>
                {/* Verification Badge */}
                {chat.verification?.isVerified && (
                  <ShieldCheckIcon className="w-3 h-3 text-cyan-400" title="Verified" />
                )}
              </div>
              
              {/* Status Text */}
              {chat.statusText && (
                <p className="text-slate-400 text-sm truncate mt-0.5">
                  {chat.statusText}
                </p>
              )}
              
              {/* Last Activity */}
              <p className="text-slate-500 text-xs mt-1">
                {onlineUsers.includes(chat._id) ? "Online" : "Last seen recently"}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(chat);
                }}
                className="p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                title="Open Chat"
              >
                <MessageSquareIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openProfileSidebar(chat);
                }}
                className="p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                title="View Profile"
              >
                <UserIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
export default ChatsList;
