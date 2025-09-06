function UserSearch({ onUserSelect, onClose }) {
  try {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [recentUsers, setRecentUsers] = React.useState([]);

    React.useEffect(() => {
      loadRecentUsers();
    }, []);

    React.useEffect(() => {
      const searchTimeout = setTimeout(() => {
        if (searchQuery.trim()) {
          handleSearch();
        } else {
          setSearchResults([]);
        }
      }, 300);

      return () => clearTimeout(searchTimeout);
    }, [searchQuery]);

    const loadRecentUsers = async () => {
      try {
        const users = await loadRealUsers();
        setRecentUsers(users.slice(0, 5)); // Show first 5 users
      } catch (error) {
        console.error('Failed to load recent users:', error);
      }
    };

    const handleSearch = async () => {
      setLoading(true);
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleUserClick = async (user) => {
      try {
        const chat = await createChatWithUser(user.id, user.name);
        if (chat) {
          await addToContacts(user.id);
          onUserSelect(chat);
        } else {
          console.error('Failed to create chat with user');
        }
      } catch (error) {
        console.error('Error creating chat:', error);
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-name="user-search" data-file="components/UserSearch.js">
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Find People</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="icon-x text-[var(--text-secondary)]"></div>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]"></div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Search Results</h3>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recent Users */}
          {!searchQuery && recentUsers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Recent Users</h3>
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {searchQuery && !loading && searchResults.length === 0 && (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <div className="icon-users text-2xl mb-2 mx-auto"></div>
              <p>No users found</p>
              <p className="text-sm mt-1">Try searching with a different name or email</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('UserSearch component error:', error);
    return null;
  }
}