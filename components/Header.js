function Header({ user }) {
  try {
    const [showMenu, setShowMenu] = React.useState(false);

    const handleLogout = () => {
      logoutUser();
      window.location.href = 'auth.html';
    };

    return (
      <header className="bg-white border-b border-[var(--border-color)] px-4 py-3" data-name="header" data-file="components/Header.js">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[var(--primary-color)] rounded-lg flex items-center justify-center">
              <div className="icon-message-circle text-white"></div>
            </div>
            <h1 className="text-xl font-bold text-[var(--primary-color)]">ChatRizz</h1>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
              >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-[var(--text-primary)] font-medium">{user?.name}</span>
              <div className="icon-chevron-down text-[var(--text-secondary)]"></div>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[var(--border-color)] z-50">
              <div className="py-2">
                <a
                  href="profile.html"
                  className="flex items-center px-4 py-2 text-[var(--text-primary)] hover:bg-gray-50"
                >
                  <div className="icon-user text-[var(--text-secondary)] mr-3"></div>
                  Profile & Settings
                </a>
                <a
                  href="invite.html"
                  className="flex items-center px-4 py-2 text-[var(--text-primary)] hover:bg-gray-50"
                >
                  <div className="icon-user-plus text-[var(--text-secondary)] mr-3"></div>
                  Invite Friends
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <div className="icon-log-out text-red-600 mr-3"></div>
                  Sign Out
                </button>
              </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </header>
    );
  } catch (error) {
    console.error('Header component error:', error);
    return null;
  }
}