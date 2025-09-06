function AdminDashboard({ user }) {
  try {
    const [activeTab, setActiveTab] = React.useState('users');
    const [users, setUsers] = React.useState([]);
    const [stats, setStats] = React.useState({
      totalUsers: 0,
      activeUsers: 0,
      totalMessages: 0,
      totalChats: 0
    });

    React.useEffect(() => {
      loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
      try {
        // Mock admin data
        setUsers([
          { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', createdAt: '2025-01-01', lastActive: '2025-01-09' },
          { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'active', createdAt: '2025-01-02', lastActive: '2025-01-09' }
        ]);
        setStats({
          totalUsers: 1247,
          activeUsers: 892,
          totalMessages: 45623,
          totalChats: 1891
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    const handleLogout = () => {
      logoutUser();
      window.location.href = 'auth.html';
    };

    return (
      <div className="min-h-screen" data-name="admin-dashboard" data-file="components/AdminDashboard.js">
        {/* Header */}
        <header className="bg-white border-b border-[var(--border-color)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--primary-color)] rounded-lg flex items-center justify-center">
                <div className="icon-shield text-white"></div>
              </div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">ChatRizz Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-[var(--text-secondary)]">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg"
              >
                <div className="icon-log-out"></div>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="admin-card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="icon-users text-xl text-blue-600"></div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalUsers}</p>
                  <p className="text-[var(--text-secondary)]">Total Users</p>
                </div>
              </div>
            </div>
            
            <div className="admin-card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="icon-activity text-xl text-green-600"></div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.activeUsers}</p>
                  <p className="text-[var(--text-secondary)]">Active Users</p>
                </div>
              </div>
            </div>
            
            <div className="admin-card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="icon-message-square text-xl text-purple-600"></div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalMessages}</p>
                  <p className="text-[var(--text-secondary)]">Messages</p>
                </div>
              </div>
            </div>
            
            <div className="admin-card">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <div className="icon-message-circle text-xl text-orange-600"></div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalChats}</p>
                  <p className="text-[var(--text-secondary)]">Chats</p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">User Management</h2>
              <div className="flex space-x-3">
                <input
                  type="search"
                  placeholder="Search users..."
                  className="px-4 py-2 border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <span className="ml-3 font-medium text-[var(--text-primary)]">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--text-secondary)]">{user.createdAt}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                            <div className="icon-edit text-sm"></div>
                          </button>
                          <button className="text-red-600 hover:bg-red-50 p-1 rounded">
                            <div className="icon-trash text-sm"></div>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AdminDashboard component error:', error);
    return null;
  }
}
