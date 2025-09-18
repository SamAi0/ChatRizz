import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import UserProfileSidebar from "../components/UserProfileSidebar";

function ChatPage() {
  const { activeTab, selectedUser, profileUser, isProfileSidebarOpen, closeProfileSidebar } = useChatStore();

  return (
    <div className="relative w-full h-screen">
      <BorderAnimatedContainer>
        {/* LEFT SIDEBAR - Profile + Contacts/Chats */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* MIDDLE - Chat Area */}
        <div className={`flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm transition-all duration-300 ${
          isProfileSidebarOpen ? 'lg:mr-80' : ''
        }`}>
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>

        {/* RIGHT SIDEBAR - User Profile (Desktop) */}
        <div className={`hidden lg:block transition-all duration-300 ${
          isProfileSidebarOpen ? 'w-80' : 'w-0'
        }`}>
          {isProfileSidebarOpen && (
            <UserProfileSidebar
              isOpen={isProfileSidebarOpen}
              onClose={closeProfileSidebar}
              user={profileUser}
            />
          )}
        </div>
      </BorderAnimatedContainer>

      {/* Mobile Profile Sidebar Overlay */}
      <div className="lg:hidden">
        <UserProfileSidebar
          isOpen={isProfileSidebarOpen}
          onClose={closeProfileSidebar}
          user={profileUser}
        />
      </div>
    </div>
  );
}
export default ChatPage;
