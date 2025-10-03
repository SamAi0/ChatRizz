import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, ShieldCheckIcon } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import Logo from "../../components/Logo";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Use the admin login endpoint
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      // Store admin user data
      useAuthStore.getState().setAuthUser(data);
      toast.success("Admin login successful");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error(error.message || "Admin login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute top-4 left-4 z-10">
          <Logo size="xl" animated={true} />
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-red-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-400">Access the ChatRizz admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="admin@chatrizz.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:outline-none transition-colors pr-10"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoggingIn ? "Signing in..." : "Sign In as Admin"}
            </button>
          </form>

          {/* Warning */}
          <div className="mt-6 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">
              ⚠️ This is an admin-only area. Unauthorized access is prohibited.
            </p>
          </div>

          {/* Back to regular login */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-slate-400 text-sm hover:text-slate-200 transition-colors"
            >
              ← Back to regular login
            </button>
          </div>
        </div>

        {/* Test Credentials (for development) */}
        <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
          <p className="text-slate-400 text-sm mb-2">Test Admin Credentials:</p>
          <p className="text-xs text-slate-500">Email: admin@chatrizz.com</p>
          <p className="text-xs text-slate-500">Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;