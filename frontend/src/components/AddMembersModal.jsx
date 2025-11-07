import { useState } from "react";
import { XIcon, UsersIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

function AddMembersModal({ onClose, group, contacts }) {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { getGroups } = useChatStore();

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      const response = await axiosInstance.post(`/groups/${group._id}/members`, {
        members: selectedMembers
      });

      toast.success("Members added successfully!");
      getGroups(); // Refresh groups list
      
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add members");
    }
  };

  // Filter out existing members from the contact list
  const availableContacts = contacts.filter(contact => 
    !group.members.some(member => member.user._id === contact._id || member.user.id === contact._id)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-200">Add Members to Group</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <XIcon className="text-slate-400" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Group Info */}
          <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
            <div className="size-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {group.avatar ? (
                <img 
                  src={group.avatar} 
                  alt={group.name} 
                  className="size-full object-cover"
                />
              ) : (
                <UsersIcon className="text-white" size={20} />
              )}
            </div>
            <div>
              <div className="font-medium text-slate-200">{group.name}</div>
              <div className="text-xs text-slate-400">{group.members.length} members</div>
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Select Members ({selectedMembers.length} selected)
            </label>
            {availableContacts.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border border-slate-600 rounded-lg bg-slate-700/30">
                {availableContacts.map(contact => (
                  <div 
                    key={contact._id}
                    className="flex items-center gap-3 p-2 hover:bg-slate-700/50 cursor-pointer"
                    onClick={() => handleMemberToggle(contact._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(contact._id)}
                      onChange={() => handleMemberToggle(contact._id)}
                      className="rounded text-cyan-500 focus:ring-cyan-500"
                    />
                    <img 
                      src={contact.profilePic || "/avatar.png"} 
                      alt={contact.fullName} 
                      className="size-8 rounded-full object-cover"
                    />
                    <span className="text-slate-200">{contact.fullName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-sm p-4 text-center">
                No available contacts to add
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={selectedMembers.length === 0}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Members
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMembersModal;