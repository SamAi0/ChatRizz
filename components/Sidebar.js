function Sidebar({ selectedChat, setSelectedChat, isMobile }) {
  try {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filteredChats, setFilteredChats] = React.useState(mockChats);
    const [showUserSearch, setShowUserSearch] = React.useState(false);

    React.useEffect(() => {
      if (searchQuery) {
        const filtered = mockChats.filter(chat =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredChats(filtered);
      } else {
        setFilteredChats(mockChats);
      }
    }, [searchQuery]);

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString();
    };

    return (
      <div className="h-screen flex flex-col" data-name="sidebar" data-file="components/Sidebar.js">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[var(--primary-color)]">ChatRizz</h1>
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90"
              title="Start new chat"
            >
              <div className="icon-plus text-lg"></div>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <div className="icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]"></div>
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--secondary-color)] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <ContactList
            chats={filteredChats}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            formatTime={formatTime}
          />
        </div>

        {/* User Search Modal */}
        {showUserSearch && (
          <UserSearch
            onUserSelect={(chat) => {
              setSelectedChat(chat);
              // Add to filtered chats if not already present
              if (!filteredChats.find(c => c.id === chat.id)) {
                setFilteredChats(prev => [chat, ...prev]);
              }
            }}
            onClose={() => setShowUserSearch(false)}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Sidebar component error:', error);
    return null;
  }
}