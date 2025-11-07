import { useEffect, useMemo, useState } from "react";
import { UserIcon, UsersIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

function GroupsList() {
  const { getGroups, groups, isUsersLoading, setSelectedGroup } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getGroups();
  }, [getGroups]);

  const filtered = useMemo(
    () =>
      groups.filter((g) => g.name.toLowerCase().includes(query.trim().toLowerCase())),
    [groups, query]
  );

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    // Navigate to main chat page with group selected
    navigate("/");
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (groups.length === 0) return <NoChatsFound />;

  return (
    <>
      <div className="p-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search groups..."
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-3 text-sm"
        />
      </div>
      {filtered.map((group) => (
        <div
          key={group._id}
          className="bg-slate-800/50 p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors relative group"
          onClick={() => handleGroupClick(group)}
        >
          <div className="flex items-center gap-3">
            {/* Group Avatar */}
            <div className="relative">
              <div className="size-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {group.avatar ? (
                  <img 
                    src={group.avatar} 
                    alt={group.name} 
                    className="size-full object-cover"
                  />
                ) : (
                  <UsersIcon className="text-white size-6" />
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-slate-200 font-medium truncate flex items-center gap-2">
                {group.name}
                {group.isPublic && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                    Public
                  </span>
                )}
              </h4>
              <p className="text-slate-400 text-sm truncate">
                {group.members?.length || 0} members
              </p>
              {group.description && (
                <p className="text-slate-500 text-xs truncate">
                  {group.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default GroupsList;