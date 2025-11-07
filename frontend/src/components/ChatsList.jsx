import { useEffect, useMemo, useState } from "react";
import { UserIcon, UsersIcon, PlusIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import CreateGroupModal from "./CreateGroupModal";
import { useNavigate } from "react-router-dom";

function ChatsList() {
  const { 
    getMyChatPartners, 
    getAllContacts,
    chats, 
    allContacts,
    isUsersLoading, 
    setSelectedUser,
    getGroups,
    groups,
    setSelectedGroup
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [query, setQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getMyChatPartners();
    getAllContacts();
    getGroups();
  }, [getMyChatPartners, getAllContacts, getGroups]);

  const filtered = useMemo(() => {
    // Combine chats and groups for filtering
    const allItems = [
      ...chats.map(chat => ({ ...chat, type: 'chat' })),
      ...groups.map(group => ({ ...group, type: 'group' }))
    ];
    
    return allItems.filter(item => {
      if (item.type === 'chat') {
        return item.fullName.toLowerCase().includes(query.trim().toLowerCase());
      } else {
        return item.name.toLowerCase().includes(query.trim().toLowerCase());
      }
    });
  }, [chats, groups, query]);

  const handleProfileClick = (e, chatId) => {
    e.stopPropagation();
    // Dispatch event to open profile sidebar
    window.dispatchEvent(new CustomEvent('openProfileSidebar', { detail: { userId: chatId } }));
  };

  const handleGroupClick = (group) => {
    // Set the selected group in the store and navigate to the group page
    setSelectedGroup(group);
    navigate(`/group/${group._id}`);
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0 && groups.length === 0) return <NoChatsFound />;

  return (
    <>
      <div className="p-2">
        <div className="flex gap-2 mb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-3 text-sm"
          />
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 hover:bg-slate-700/50 transition-colors"
            title="Create group"
          >
            <PlusIcon className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
      
      {filtered.map((item) => (
        item.type === 'chat' ? (
          <div
            key={item._id}
            className="bg-slate-800/50 p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors relative group"
            onClick={() => setSelectedUser(item)}
          >
            <div className="flex items-center gap-3">
              {/* Circular Avatar with Online/Offline Indicator */}
              <div className="relative">
                <div className="size-12 rounded-full overflow-hidden">
                  <img 
                    src={item.profilePic || "/avatar.png"} 
                    alt={item.fullName} 
                    className="size-full object-cover"
                  />
                </div>
                {/* Online/Offline Indicator */}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${
                  onlineUsers.includes(item._id) ? "online-indicator" : "offline-indicator"
                }`}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-200 font-medium truncate">{item.fullName}</h4>
                {item.statusText && (
                  <p className="text-slate-400 text-sm truncate">{item.statusText}</p>
                )}
                {/* Show online status */}
                <p className="text-slate-500 text-xs">
                  {onlineUsers.includes(item._id) ? "Online" : "Offline"}
                </p>
              </div>
              
              {/* Profile View Button */}
              <button
                onClick={(e) => handleProfileClick(e, item._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white"
                title="View Profile"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            key={item._id}
            className="bg-slate-800/50 p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors relative group"
            onClick={() => handleGroupClick(item)}
          >
            <div className="flex items-center gap-3">
              {/* Group Avatar */}
              <div className="relative">
                <div className="size-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {item.avatar ? (
                    <img 
                      src={item.avatar} 
                      alt={item.name} 
                      className="size-full object-cover"
                    />
                  ) : (
                    <UsersIcon className="text-white" size={20} />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-200 font-medium truncate flex items-center gap-2">
                  {item.name}
                  {item.isPublic && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                      Public
                    </span>
                  )}
                </h4>
                <p className="text-slate-400 text-sm truncate">
                  {item.members?.length || 0} members
                </p>
                {item.description && (
                  <p className="text-slate-500 text-xs truncate">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      ))}
      
      {showCreateGroup && (
        <CreateGroupModal 
          onClose={() => setShowCreateGroup(false)} 
          contacts={allContacts} 
        />
      )}
    </>
  );
}
export default ChatsList;