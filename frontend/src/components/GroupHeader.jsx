import { useState } from "react";
import { Menu, MoreVertical, Users, Settings, Bell, BellOff, UserPlus, LogOut, Crown } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import AddMembersModal from "./AddMembersModal";
import GroupSettingsModal from "./GroupSettingsModal";
import ManageAdminsModal from "./ManageAdminsModal";
import { axiosInstance } from "../lib/axios";

function GroupHeader() {
  const { selectedGroup, leaveGroup, setSelectedGroup, getAllContacts, allContacts } = useChatStore();
  const { authUser } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showGroupSettingsModal, setShowGroupSettingsModal] = useState(false);
  const [showManageAdminsModal, setShowManageAdminsModal] = useState(false);
  const [isFetchingContacts, setIsFetchingContacts] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // This would come from user preferences in a real app
  const navigate = useNavigate();

  // Function to get user ID whether populated or not
  const getUserId = (user) => {
    if (typeof user === 'object' && user !== null) {
      return user._id || user.id;
    }
    return user;
  };

  // Fix group member identification
  const isAdmin = selectedGroup?.admins?.some(admin => {
    const adminId = getUserId(admin);
    return adminId === authUser?.id;
  });
  
  const isMember = selectedGroup?.members?.some(member => {
    const memberId = getUserId(member.user);
    return memberId === authUser?.id;
  });

  const handleLeaveGroup = async () => {
    if (selectedGroup && isMember) {
      try {
        await leaveGroup(selectedGroup._id);
        navigate("/"); // Navigate back to main chat page after leaving
      } catch (error) {
        console.error("Failed to leave group:", error);
      }
    }
  };

  const handleGroupSettings = () => {
    setShowGroupSettingsModal(true);
    setShowMenu(false);
  };

  const handleMuteNotifications = () => {
    // Toggle mute notifications
    setIsMuted(!isMuted);
    // In a real app, this would save to user preferences
    console.log(`Notifications ${!isMuted ? "muted" : "unmuted"} for group ${selectedGroup?.name}`);
    setShowMenu(false);
  };

  const handleAddMembers = async () => {
    // Fetch all contacts before showing the modal
    setIsFetchingContacts(true);
    try {
      await getAllContacts();
      setShowAddMembersModal(true);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setIsFetchingContacts(false);
    }
    setShowMenu(false);
  };

  const handleManageAdmins = () => {
    setShowManageAdminsModal(true);
    setShowMenu(false);
  };

  const handleBack = () => {
    setSelectedGroup(null);
    navigate("/");
  };

  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="lg:hidden">
            <Menu size={20} className="text-slate-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {selectedGroup?.avatar ? (
                <img 
                  src={selectedGroup.avatar} 
                  alt={selectedGroup.name} 
                  className="size-full object-cover"
                />
              ) : (
                <Users className="text-white" size={20} />
              )}
            </div>
            <div>
              <h2 className="font-medium text-slate-200 flex items-center gap-2">
                {selectedGroup?.name}
                {selectedGroup?.isPublic && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                    Public
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedGroup?.members?.length || 0} members
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
          >
            <MoreVertical size={20} className="text-slate-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 rounded-lg shadow-lg w-48 dropdown-menu">
              <div className="py-1">
                <button 
                  onClick={handleGroupSettings}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700/50 transition-colors"
                >
                  <Settings size={16} />
                  Group Settings
                </button>
                <button 
                  onClick={handleMuteNotifications}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700/50 transition-colors"
                >
                  {isMuted ? <BellOff size={16} /> : <Bell size={16} />}
                  {isMuted ? "Unmute" : "Mute"} Notifications
                </button>
                {isAdmin && (
                  <button 
                    onClick={handleManageAdmins}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700/50 transition-colors"
                  >
                    <Crown size={16} />
                    Manage Admins
                  </button>
                )}
                {isAdmin && (
                  <button 
                    onClick={handleAddMembers}
                    disabled={isFetchingContacts}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                  >
                    <UserPlus size={16} />
                    {isFetchingContacts ? "Loading..." : "Add Members"}
                  </button>
                )}
                {isMember && (
                  <button 
                    onClick={handleLeaveGroup}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-400 hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    Leave Group
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Members Modal */}
      {showAddMembersModal && (
        <AddMembersModal 
          onClose={() => setShowAddMembersModal(false)} 
          group={selectedGroup} 
          contacts={allContacts} 
        />
      )}

      {/* Group Settings Modal */}
      {showGroupSettingsModal && (
        <GroupSettingsModal 
          onClose={() => setShowGroupSettingsModal(false)} 
          group={selectedGroup} 
        />
      )}

      {/* Manage Admins Modal */}
      {showManageAdminsModal && (
        <ManageAdminsModal 
          onClose={() => setShowManageAdminsModal(false)} 
          group={selectedGroup} 
        />
      )}
    </>
  );
}

export default GroupHeader;