import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const handleContactClick = (contact) => {
    setSelectedUser(contact);
  };

  const handleProfileClick = (e, contactId) => {
    e.stopPropagation();
    navigate(`/profile/${contactId}`);
  };

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-cyan-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors relative group"
          onClick={() => handleContactClick(contact)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-slate-200 font-medium">{contact.fullName}</h4>
              {contact.statusText && (
                <p className="text-slate-400 text-sm truncate">{contact.statusText}</p>
              )}
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
