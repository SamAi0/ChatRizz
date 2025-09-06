function MessageBubble({ message, isGroup = false }) {
  try {
    const isMyMessage = message.sender === 'me';
    
    const formatMessageTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <div 
        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} items-end space-x-2 mb-2`}
        data-name="message-bubble" 
        data-file="components/MessageBubble.js"
      >
        {!isMyMessage && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {(message.senderName || message.sender).charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className={`message-bubble ${
          isMyMessage
            ? 'bg-[var(--primary-color)] text-white'
            : 'bg-[var(--message-bg)] text-[var(--text-primary)]'
        }`}>
          {!isMyMessage && isGroup && message.senderName && (
            <p className="text-xs font-semibold text-[var(--primary-color)] mb-1">
              {message.senderName}
            </p>
          )}
          
          <p className="text-sm leading-relaxed">{message.text}</p>
          
          {message.isTranslated && (
            <div className="flex items-center mt-1 mb-1">
              <div className="icon-globe text-xs text-blue-400 mr-1"></div>
              <span className="text-xs text-blue-400">
                Translated from {getLanguageName(message.originalLanguage)}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className={`text-xs ${
              isMyMessage ? 'text-blue-100' : 'text-[var(--text-secondary)]'
            }`}>
              {formatMessageTime(message.timestamp)}
            </span>
            
            {isMyMessage && (
              <div className="flex items-center space-x-1">
                {message.status === 'sent' && (
                  <div className="icon-check text-xs text-blue-200"></div>
                )}
                {message.status === 'delivered' && (
                  <div className="icon-check-check text-xs text-blue-200"></div>
                )}
                {message.status === 'read' && (
                  <>
                    <div className="icon-check-check text-xs text-[var(--accent-color)]"></div>
                    {message.readAt && (
                      <span className="text-xs text-blue-100">
                        Read
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {isMyMessage && (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            M
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('MessageBubble component error:', error);
    return null;
  }
}