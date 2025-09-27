import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import ProfileSidebar from "../components/ProfileSidebar";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  // Listen for the custom event to open the profile sidebar
  useEffect(() => {
    const openProfileSidebar = (event) => {
      setProfileUserId(event.detail.userId);
      setIsProfileSidebarOpen(true);
    };
    
    window.addEventListener('openProfileSidebar', openProfileSidebar);
    
    return () => {
      window.removeEventListener('openProfileSidebar', openProfileSidebar);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <BorderAnimatedContainer>
        {/* LEFT SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm relative">
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </BorderAnimatedContainer>
      
      {/* Profile Sidebar */}
      <ProfileSidebar 
        isOpen={isProfileSidebarOpen} 
        onClose={() => setIsProfileSidebarOpen(false)} 
        userId={profileUserId}
      />
      
      {/* Floating Profile Button */}
      <button
        onClick={() => {
          setProfileUserId(null); // Show current user's profile
          setIsProfileSidebarOpen(true);
        }}
        className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors border border-slate-700"
        title="View Profile"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
export default ChatPage;