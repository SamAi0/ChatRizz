import React, { useState } from 'react';
import ChatContainer from './components/ChatContainer';
import LandingPage from './components/LandingPage';
import StatusDashboard from './components/StatusDashboard';
import { ChatUser, Message, User } from './types';
import './App.css';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showStatusDashboard, setShowStatusDashboard] = useState(false);

  // Sample chat user data
  const sampleChatUser: ChatUser = {
    id: '1',
    name: 'John Doe',
    isOnline: true,
    language: 'en',
  };

  // Sample initial messages with new structure
  const initialMessages: Message[] = [
    {
      id: '1',
      text: 'Hello! How are you today?',
      srcLang: 'en',
      destLang: 'es',
      translatedText: '¡Hola! ¿Cómo estás hoy?',
      senderId: '1',
      timestamp: new Date(Date.now() - 60000),
      sender: 'other',
      senderName: 'John Doe',
      senderLanguage: 'en',
    },
    {
      id: '2',
      text: 'Hi! I\'m doing great, thanks for asking!',
      srcLang: 'es',
      destLang: 'en',
      translatedText: 'Hi! I\'m doing great, thanks for asking!',
      senderId: 'user',
      timestamp: new Date(Date.now() - 30000),
      sender: 'user',
      senderName: 'You',
      senderLanguage: 'es',
    },
    {
      id: '3',
      text: 'That\'s wonderful to hear! What have you been up to?',
      srcLang: 'en',
      destLang: 'es',
      translatedText: '¡Es maravilloso escuchar eso! ¿Qué has estado haciendo?',
      senderId: '1',
      timestamp: new Date(Date.now() - 15000),
      sender: 'other',
      senderName: 'John Doe',
      senderLanguage: 'en',
    },
    {
      id: '4',
      text: 'I\'ve been working on some exciting projects lately.',
      srcLang: 'es',
      destLang: 'en',
      translatedText: 'I\'ve been working on some exciting projects lately.',
      senderId: 'user',
      timestamp: new Date(Date.now() - 10000),
      sender: 'user',
      senderName: 'You',
      senderLanguage: 'es',
    },
  ];

  const handleSignIn = (user: User) => {
    setCurrentUser(user);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  const toggleStatusDashboard = () => {
    setShowStatusDashboard(!showStatusDashboard);
  };

  if (!currentUser) {
    return <LandingPage onSignIn={handleSignIn} />;
  }

  return (
    <div className="App">
      <div className="flex h-screen">
        {/* Main Chat Area */}
        <div className="flex-1 relative">
          <ChatContainer 
            user={sampleChatUser} 
            currentUser={currentUser}
            initialMessages={initialMessages} 
          />
          
          {/* Status Dashboard Toggle Button */}
          <button 
            className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            onClick={toggleStatusDashboard}
            title="Toggle Status Dashboard"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">Status</span>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              className={`w-4 h-4 transition-transform ${showStatusDashboard ? 'rotate-180' : ''}`}
            >
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Status Dashboard Sidebar */}
        {showStatusDashboard && (
          <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                <button 
                  onClick={toggleStatusDashboard}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              
              <StatusDashboard
                isConnected={true}
                readyState={WebSocket.OPEN}
                reconnectAttempts={0}
                connectionDuration={3600000} // 1 hour in milliseconds
                lastActivity={new Date()}
                errorMessage={null}
                className="mb-4"
              />
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors">
                      Refresh Connection
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors">
                      View Logs
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors">
                      Export Status Report
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">System Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Version:</span>
                      <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Environment:</span>
                      <span className="font-medium">Development</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="font-medium">{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <button 
        className="sign-out-button"
        onClick={handleSignOut}
      >
        Sign Out
      </button>
    </div>
  );
};

export default App; 