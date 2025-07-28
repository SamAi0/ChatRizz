import React from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import EmptyState from './components/EmptyState';
import { useChat } from './hooks/useChat';

function App() {
  const { 
    contacts, 
    messages, 
    activeChat, 
    searchQuery,
    isSearching,
    isDarkMode,
    setActiveChat, 
    sendMessage,
    sendVoiceMessage,
    addReaction,
    searchMessages,
    toggleTheme,
    userLanguage,
    setUserLanguage
  } = useChat();

  const selectedContact = contacts.find((contact: typeof contacts[0]) => contact.id === activeChat);
  const currentMessages = activeChat ? messages[activeChat] || [] : [];

  const handleSendMessage = (text: string) => {
    if (activeChat) {
      sendMessage(activeChat, text);
    }
  };

  const handleSendVoice = (audioBlob: Blob, duration: number) => {
    if (activeChat) {
      sendVoiceMessage(activeChat, audioBlob, duration);
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (activeChat) {
      addReaction(activeChat, messageId, emoji);
    }
  };

  const handleSearchToggle = () => {
    if (isSearching) {
      searchMessages('');
    } else {
      searchMessages('search');
    }
  };
  return (
    <div className={`h-screen flex ${
      isDarkMode 
        ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900' 
        : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'
    }`}>
      {/* Sidebar - hidden on mobile when chat is active */}
      <div className={`${activeChat ? 'hidden lg:block' : 'block'} lg:flex-shrink-0`}>
        <Sidebar
          contacts={contacts}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
          userLanguage={userLanguage}
          setUserLanguage={setUserLanguage}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Mobile back button */}
            <div className="lg:hidden p-2 bg-gradient-to-r from-pink-500 to-purple-600">
              <button
                onClick={() => setActiveChat(null)}
                className="text-white text-sm"
              >
                ← Back to chats
              </button>
            </div>
            <ChatArea
              contact={selectedContact}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              onSendVoice={handleSendVoice}
              onAddReaction={handleAddReaction}
              searchQuery={searchQuery}
              isSearching={isSearching}
              onSearch={searchMessages}
              onCloseSearch={() => searchMessages('')}
            />
          </>
        ) : (
          <EmptyState isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
}

export default App;