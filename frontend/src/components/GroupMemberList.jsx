import { Users, Crown, Shield, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";

function GroupMemberList({ group }) {
  const { authUser } = useAuthStore();
  const { setSelectedGroup, getGroups } = useChatStore();

  if (!group || !group.members) return null;

  // Check if current user is admin
  const isAdmin = group.admins.some(admin => {
    // Handle both populated and non-populated admin objects
    if (typeof admin === 'object' && admin !== null) {
      return admin._id === authUser?.id || admin.id === authUser?.id;
    }
    // Handle string IDs
    return admin === authUser?.id;
  });

  // Function to get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  // Function to get role label
  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderator";
      default:
        return "Member";
    }
  };

  // Function to get user ID whether populated or not
  const getUserId = (user) => {
    if (typeof user === 'object' && user !== null) {
      return user._id || user.id;
    }
    return user;
  };

  // Function to get user full name
  const getUserFullName = (user) => {
    if (typeof user === 'object' && user !== null) {
      return user.fullName || user.name || "Unknown User";
    }
    return "Unknown User";
  };

  const handleMakeAdmin = async (memberId) => {
    if (!isAdmin) return;
    
    try {
      const response = await axiosInstance.post(`/groups/${group._id}/admins/${memberId}`);
      toast.success("User is now an admin!");
      setSelectedGroup(response.data);
      getGroups(); // Refresh groups list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to make user admin");
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">Members ({group.members.length})</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {group.members.map((member) => {
          // Get the user object, handling both populated and non-populated cases
          const user = member.user;
          const userId = getUserId(user);
          const userFullName = getUserFullName(user);
          
          // Check if this is the current user
          const isCurrentUser = userId === authUser?.id;
          
          // Check if this user is already an admin
          const isAlreadyAdmin = group.admins.some(admin => {
            const adminId = getUserId(admin);
            return adminId === userId;
          });
          
          return (
            <div key={userId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={typeof user === 'object' && user !== null ? (user.profilePic || "/avatar.png") : "/avatar.png"}
                  alt={userFullName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm text-slate-200 flex items-center gap-1">
                    {userFullName}
                    {isCurrentUser && (
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {typeof user === 'object' && user !== null ? (user.statusText || "Available") : "Available"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {getRoleIcon(member.role)}
                <span className="text-xs text-slate-400">{getRoleLabel(member.role)}</span>
                {isAdmin && !isAlreadyAdmin && !isCurrentUser && (
                  <button
                    onClick={() => handleMakeAdmin(userId)}
                    className="p-1 rounded hover:bg-slate-700"
                    title="Make admin"
                  >
                    <UserPlus className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GroupMemberList;