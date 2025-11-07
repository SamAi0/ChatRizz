import { useState } from "react";
import { XIcon, Crown, User } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function ManageAdminsModal({ onClose, group }) {
  const { getGroups, setSelectedGroup } = useChatStore();
  const { authUser } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState({});

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

  // Check if current user is admin
  const isAdmin = group.admins.some(admin => {
    const adminId = getUserId(admin);
    return adminId === authUser?.id;
  });

  // Get members who are not admins
  const nonAdminMembers = group.members.filter(member => 
    !group.admins.some(admin => {
      const adminId = getUserId(admin);
      const memberId = getUserId(member.user);
      return adminId === memberId;
    })
  );

  // Get admins
  const admins = group.admins;

  const handleMakeAdmin = async (memberId) => {
    if (!isAdmin) return;
    
    setIsProcessing(prev => ({ ...prev, [memberId]: true }));
    try {
      const response = await axiosInstance.post(`/groups/${group._id}/admins/${memberId}`);
      toast.success("User is now an admin!");
      setSelectedGroup(response.data);
      getGroups(); // Refresh groups list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to make user admin");
    } finally {
      setIsProcessing(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    // Prevent removing the last admin
    if (group.admins.length <= 1) {
      toast.error("Cannot remove the last admin");
      return;
    }
    
    // Prevent admins from removing themselves
    if (adminId === authUser.id) {
      toast.error("You cannot remove yourself as admin");
      return;
    }
    
    if (!isAdmin) return;
    
    setIsProcessing(prev => ({ ...prev, [adminId]: true }));
    try {
      const response = await axiosInstance.delete(`/groups/${group._id}/admins/${adminId}`);
      toast.success("User is no longer an admin!");
      setSelectedGroup(response.data);
      getGroups(); // Refresh groups list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove admin");
    } finally {
      setIsProcessing(prev => ({ ...prev, [adminId]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-200">Manage Admins</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <XIcon className="text-slate-400" size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Current Admins */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Current Admins
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {admins.map((admin) => {
                const adminId = getUserId(admin);
                const adminFullName = getUserFullName(admin);
                const isAdminUser = adminId === authUser?.id;
                const isLastAdmin = admins.length === 1;
                
                return (
                  <div key={adminId} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <img
                        src={typeof admin === 'object' && admin !== null ? (admin.profilePic || "/avatar.png") : "/avatar.png"}
                        alt={adminFullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm text-slate-200">{adminFullName}</div>
                        {isAdminUser && (
                          <div className="text-xs text-slate-400">You</div>
                        )}
                      </div>
                    </div>
                    {isAdmin && !isAdminUser && (
                      <button
                        onClick={() => handleRemoveAdmin(adminId)}
                        disabled={isProcessing[adminId] || isLastAdmin}
                        className="text-xs bg-red-900/50 hover:bg-red-900/70 text-red-300 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing[adminId] ? "Removing..." : "Remove"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Make Admin Section */}
          {isAdmin && nonAdminMembers.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Make Admin
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {nonAdminMembers.map((member) => {
                  const userId = getUserId(member.user);
                  const userFullName = getUserFullName(member.user);
                  
                  return (
                    <div key={userId} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <img
                          src={typeof member.user === 'object' && member.user !== null ? (member.user.profilePic || "/avatar.png") : "/avatar.png"}
                          alt={userFullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="text-sm text-slate-200">{userFullName}</div>
                      </div>
                      <button
                        onClick={() => handleMakeAdmin(userId)}
                        disabled={isProcessing[userId]}
                        className="text-xs bg-cyan-900/50 hover:bg-cyan-900/70 text-cyan-300 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing[userId] ? "Making..." : "Make Admin"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isAdmin && nonAdminMembers.length === 0 && (
            <div className="text-slate-400 text-sm text-center py-4">
              No members available to make admin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageAdminsModal;