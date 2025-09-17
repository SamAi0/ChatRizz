import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UsersIcon,
  ShieldCheckIcon,
  UserIcon,
  TrendingUpIcon,
  CalendarIcon,
  SettingsIcon,
  LogOutIcon,
  SearchIcon,
  TrashIcon,
  PlusIcon,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { authUser, logout } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Check if user is admin
  useEffect(() => {
    if (!authUser || (!authUser.isAdmin && authUser.role !== "admin" && authUser.role !== "superadmin")) {
      navigate("/admin/login");
      return;
    }
  }, [authUser, navigate]);

  // Fetch dashboard stats
  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard/stats", {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch stats");
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard stats");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        role: roleFilter,
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch users");
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      fetchUsers();
      fetchDashboardStats();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error("Failed to update role");

      toast.success("User role updated successfully");
      fetchUsers();
      fetchDashboardStats();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  if (!authUser || (!authUser.isAdmin && authUser.role !== "admin" && authUser.role !== "superadmin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm">ChatRizz Administration Panel</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-slate-300">Welcome, {authUser.fullName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOutIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <UsersIcon className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-slate-400 text-sm">Admins</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAdmins}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <UserIcon className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-sm">Regular Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRegularUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <TrendingUpIcon className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-slate-400 text-sm">New (30 days)</p>
                  <p className="text-2xl font-bold text-white">{stats.newUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-sm">Today</p>
                  <p className="text-2xl font-bold text-white">{stats.usersToday}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusIcon className="w-4 h-4" />
                Add Admin
              </button>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                <option value="superadmin">Super Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profilePic || "/avatar.png"}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-white font-medium">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{user.email}</td>
                      <td className="px-6 py-4">
                        {authUser.role === "superadmin" ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "superadmin" ? "bg-red-900 text-red-200" :
                            user.role === "admin" ? "bg-yellow-900 text-yellow-200" :
                            "bg-gray-900 text-gray-200"
                          }`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user._id !== authUser._id && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                            title="Delete user"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;