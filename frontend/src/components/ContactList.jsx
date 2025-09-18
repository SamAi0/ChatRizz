import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, MessageSquareIcon, ShieldCheckIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading, openProfileSidebar } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const handleContactClick = (contact) => {
    setSelectedUser(contact);
  };

  const handleProfileClick = (e, contact) => {
    e.stopPropagation();
    openProfileSidebar(contact);
  };

  const handleFullProfileClick = (e, contactId) => {
    e.stopPropagation();
    navigate(`/profile/${contactId}`);
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-slate-800/30 hover:bg-slate-800/50 p-3 rounded-lg cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-700/50"
          onClick={() => handleContactClick(contact)}
        >
          <div className="flex items-center gap-3">
            {/* Clickable Avatar */}
            <button
              className={`relative rounded-full overflow-hidden border-2 transition-all duration-200 ${
                onlineUsers.includes(contact._id) 
                  ? "border-green-500 shadow-green-500/20 shadow-md" 
                  : "border-slate-600"
              }`}
              onClick={(e) => handleProfileClick(e, contact)}
              title="View Profile"
            >
              <div className="size-12">
                <img 
                  src={contact.profilePic || "/avatar.png"} 
                  alt={contact.fullName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
              
              {/* Online Status Badge */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${
                onlineUsers.includes(contact._id) ? "bg-green-500" : "bg-slate-500"
              }`} />
            </button>
            
            {/* Contact Info - Clickable */}
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              onClick={(e) => handleProfileClick(e, contact)}
            >
              <div className="flex items-center gap-2">
                <h4 className="text-slate-200 font-medium group-hover:text-cyan-400 transition-colors">
                  {contact.fullName}
                </h4>
                {/* Verification Badge */}
                {contact.verification?.isVerified && (
                  <ShieldCheckIcon className="w-3 h-3 text-cyan-400" title="Verified" />
                )}
              </div>
              
              {/* Status Text */}
              {contact.statusText && (
                <p className="text-slate-400 text-sm truncate mt-0.5">
                  {contact.statusText}
                </p>
              )}
              
              {/* Additional Info */}
              {contact.email && (
                <p className="text-slate-500 text-xs mt-1 truncate">
                  {contact.email}
                </p>
              )}
              
              {/* Online Status */}
              <p className="text-slate-500 text-xs mt-1">
                {onlineUsers.includes(contact._id) ? "Online" : "Offline"}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(contact);
                }}
                className="p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                title="Start Chat"
              >
                <MessageSquareIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => handleProfileClick(e, contact)}
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
export default ContactList;
