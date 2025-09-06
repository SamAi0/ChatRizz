function ContactList({ chats, selectedChat, setSelectedChat, formatTime }) {
  try {
    return (
      <div className="py-2" data-name="contact-list" data-file="components/ContactList.js">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            className={`sidebar-item mx-2 ${
              selectedChat?.id === chat.id
                ? 'bg-[var(--primary-color)] bg-opacity-10 border-l-4 border-[var(--primary-color)]'
                : ''
            }`}
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
              {chat.name.charAt(0).toUpperCase()}
            </div>

            {/* Chat Info */}
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center flex-1">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate">
                    {chat.name}
                  </h3>
                  {chat.isGroup && (
                    <div className="icon-users text-xs text-[var(--text-secondary)] ml-1"></div>
                  )}
                </div>
                <span className="text-xs text-[var(--text-secondary)] flex-shrink-0">
                  {formatTime(chat.lastMessage.timestamp)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  {chat.lastMessage.sender && chat.lastMessage.sender !== 'me' && chat.isGroup && (
                    <span className="text-xs text-[var(--text-secondary)] mr-1">
                      {chat.lastMessage.senderName?.split(' ')[0] || 'User'}:
                    </span>
                  )}
                  <p className="text-sm text-[var(--text-secondary)] truncate">
                    {chat.lastMessage.text}
                  </p>
                  {chat.lastMessage.sender === 'me' && (
                    <div className="flex items-center ml-1">
                      {chat.lastMessage.status === 'sent' && (
                        <div className="icon-check text-xs text-[var(--text-secondary)]"></div>
                      )}
                      {chat.lastMessage.status === 'delivered' && (
                        <div className="icon-check-check text-xs text-[var(--text-secondary)]"></div>
                      )}
                      {chat.lastMessage.status === 'read' && (
                        <div className="icon-check-check text-xs text-[var(--accent-color)]"></div>
                      )}
                    </div>
                  )}
                </div>
                {chat.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-[var(--accent-color)] rounded-full flex items-center justify-center ml-2">
                    <span className="text-xs text-white font-medium">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Online Status */}
            {chat.isOnline && !chat.isGroup && (
              <div className="w-3 h-3 bg-[var(--accent-color)] rounded-full border-2 border-white ml-2"></div>
            )}
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('ContactList component error:', error);
    return null;
  }
}