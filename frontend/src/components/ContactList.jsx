import { useEffect } from "react";
import { UserIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const handleContactClick = (contact) => {
    setSelectedUser(contact);
  };

  const handleProfileClick = (e, contactId) => {
    e.stopPropagation();
    // Dispatch event to open profile sidebar
    window.dispatchEvent(new CustomEvent('openProfileSidebar', { detail: { userId: contactId } }));
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-slate-800/50 p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors relative group"
          onClick={() => handleContactClick(contact)}
        >
          <div className="flex items-center gap-3">
            {/* Circular Avatar with Online/Offline Indicator */}
            <div className="relative">
              <div className="size-12 rounded-full overflow-hidden">
                <img 
                  src={contact.profilePic || "/avatar.png"} 
                  alt={contact.fullName} 
                  className="size-full object-cover"
                />
              </div>
              {/* Online/Offline Indicator */}
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${
                onlineUsers.includes(contact._id) ? "online-indicator" : "offline-indicator"
              }`}></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-slate-200 font-medium truncate">{contact.fullName}</h4>
              {contact.statusText && (
                <p className="text-slate-400 text-sm truncate">{contact.statusText}</p>
              )}
              {/* Show online status */}
              <p className="text-slate-500 text-xs">
                {onlineUsers.includes(contact._id) ? "Online" : "Offline"}
              </p>
            </div>
            
            {/* Profile View Button */}
            <button
              onClick={(e) => handleProfileClick(e, contact._id)}
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
export default ContactList;