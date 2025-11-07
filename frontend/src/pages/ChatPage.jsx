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
import GroupMemberList from "../components/GroupMemberList";

function ChatPage() {
  const { activeTab, selectedUser, selectedGroup } = useChatStore();
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

        {/* RIGHT SIDE - Main chat area */}
        <div className="flex flex-1">
          <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm relative">
            {selectedUser || selectedGroup ? <ChatContainer /> : <NoConversationPlaceholder />}
          </div>
          
          {/* Group member sidebar - only show when a group is selected */}
          {selectedGroup && (
            <div className="w-80 bg-slate-800/50 border-l border-slate-700/50 p-4 hidden lg:block">
              <GroupMemberList group={selectedGroup} />
            </div>
          )}
        </div>
      </BorderAnimatedContainer>
      
      {/* Profile Sidebar */}
      <ProfileSidebar 
        isOpen={isProfileSidebarOpen} 
        onClose={() => setIsProfileSidebarOpen(false)} 
        userId={profileUserId}
      />
    </div>
  );
}
export default ChatPage;