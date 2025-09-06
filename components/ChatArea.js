function ChatArea({ selectedChat, setSelectedChat, isMobile, user }) {
  try {
    const [messages, setMessages] = React.useState([]);
    const [isTyping, setIsTyping] = React.useState(false);
    const messagesEndRef = React.useRef(null);

    React.useEffect(() => {
      if (selectedChat) {
        setMessages(selectedChat.messages || []);
      }
    }, [selectedChat]);

    React.useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (messageText) => {
      if (!messageText.trim() || !selectedChat) return;

      const newMessage = {
        id: Date.now(),
        text: messageText,
        sender: 'me',
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      setMessages(prev => [...prev, newMessage]);

      // Simulate typing indicator and response
      setTimeout(async () => {
        setIsTyping(true);
        setTimeout(async () => {
          setIsTyping(false);
          let responseText = generateResponse(messageText);
          
          // Auto-translate response if user has preferred language
          if (user?.preferredLanguage && user.preferredLanguage !== 'en') {
            try {
              responseText = await translateText(responseText, user.preferredLanguage, 'en');
            } catch (error) {
              console.error('Translation error:', error);
            }
          }
          
          const response = {
            id: Date.now() + 1,
            text: responseText,
            sender: selectedChat.id,
            timestamp: new Date().toISOString(),
            status: 'delivered'
          };
          setMessages(prev => [...prev, response]);
        }, 1500);
      }, 500);
    };

    const formatLastSeen = (timestamp) => {
      if (!timestamp) return 'recently';
      const now = new Date();
      const lastSeen = new Date(timestamp);
      const diffMs = now - lastSeen;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 5) return 'just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return lastSeen.toLocaleDateString();
    };

    const markMessagesAsRead = () => {
      if (!selectedChat) return;
      
      setMessages(prev => prev.map(msg => {
        if (msg.sender !== 'me' && msg.status !== 'read') {
          return { ...msg, status: 'read', readAt: new Date().toISOString() };
        }
        return msg;
      }));
    };

    const generateResponse = (message) => {
      const responses = [
        "That's interesting! Tell me more.",
        "I see what you mean 👍",
        "Absolutely agree with you!",
        "Thanks for sharing that!",
        "That sounds great!",
        "I'll think about it 🤔",
        "Perfect timing!",
        "You're absolutely right!",
        "That made my day! 😊"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    };

    React.useEffect(() => {
      // Mark messages as read when chat is opened
      if (selectedChat) {
        setTimeout(markMessagesAsRead, 1000);
      }
    }, [selectedChat]);

    if (!selectedChat) {
      return null;
    }

    return (
      <div className="flex flex-col h-screen bg-white" data-name="chat-area" data-file="components/ChatArea.js">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b border-[var(--border-color)] bg-white">
          {isMobile && (
            <button
              onClick={() => setSelectedChat(null)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full"
            >
              <div className="icon-arrow-left text-[var(--text-primary)]"></div>
            </button>
          )}
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white font-semibold flex-shrink-0">
            {selectedChat.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="ml-3 flex-1">
            <h2 className="font-semibold text-[var(--text-primary)]">
              {selectedChat.name}
              {selectedChat.isGroup && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full ml-2">
                  Group
                </span>
              )}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {selectedChat.isGroup ? 
                `${selectedChat.members?.length || 0} members` :
                selectedChat.isOnline ? 
                  'Online' : 
                  `Last seen ${formatLastSeen(selectedChat.lastSeen)}`
              }
            </p>
          </div>

          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <div className="icon-phone text-[var(--text-secondary)]"></div>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <div className="icon-video text-[var(--text-secondary)]"></div>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <div className="icon-more-vertical text-[var(--text-secondary)]"></div>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              isGroup={selectedChat.isGroup}
            />
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {selectedChat.name.charAt(0).toUpperCase()}
              </div>
              <div className="message-bubble bg-[var(--message-bg)] text-[var(--text-primary)]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <ChatInput onSendMessage={sendMessage} />
      </div>
    );
  } catch (error) {
    console.error('ChatArea component error:', error);
    return null;
  }
}