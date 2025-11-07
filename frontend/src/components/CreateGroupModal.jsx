import { useState } from "react";
import { XIcon, UsersIcon, LockIcon, GlobeIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function CreateGroupModal({ onClose, contacts }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const { getGroups, setSelectedGroup } = useChatStore();
  const navigate = useNavigate();

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    try {
      const response = await axiosInstance.post("/groups", {
        name: name.trim(),
        description: description.trim(),
        members: selectedMembers,
        isPublic
      });

      toast.success("Group created successfully!");
      getGroups(); // Refresh groups list
      
      // Set the newly created group as selected and navigate to it
      const newGroup = response.data;
      setSelectedGroup(newGroup);
      navigate(`/group/${newGroup._id}`);
      
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-200">Create New Group</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <XIcon className="text-slate-400" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="size-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Group avatar" 
                    className="size-full object-cover"
                  />
                ) : (
                  <UsersIcon className="text-white" size={24} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-slate-700 rounded-full p-1 cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </label>
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Group Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter group name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter group description"
              rows={2}
            />
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Privacy
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border ${
                  !isPublic 
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" 
                    : "bg-slate-700/50 border-slate-600 text-slate-400"
                }`}
              >
                <LockIcon size={16} />
                Private
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border ${
                  isPublic 
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" 
                    : "bg-slate-700/50 border-slate-600 text-slate-400"
                }`}
              >
                <GlobeIcon size={16} />
                Public
              </button>
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Members ({selectedMembers.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto border border-slate-600 rounded-lg bg-slate-700/30">
              {contacts.map(contact => (
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateGroupModal;