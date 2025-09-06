function AuthForm() {
  try {
    const [isLogin, setIsLogin] = React.useState(true);
    const [formData, setFormData] = React.useState({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      referralCode: '',
      inviterName: ''
    });

    React.useEffect(() => {
      // Check for referral code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      const inviterName = urlParams.get('from');
      
      if (referralCode && inviterName) {
        setFormData(prev => ({
          ...prev,
          referralCode,
          inviterName: decodeURIComponent(inviterName)
        }));
        setIsLogin(false); // Show registration form for invited users
      }
    }, []);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        if (isLogin) {
          const success = await loginUser(formData.email, formData.password);
          if (success) {
            window.location.href = 'index.html';
          } else {
            alert('Invalid credentials');
          }
        } else {
          if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
          }
          const success = await registerUser(formData.name, formData.email, formData.password);
          if (success) {
            window.location.href = 'index.html';
          } else {
            alert('Registration failed');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        alert('Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="auth-card" data-name="auth-form" data-file="components/AuthForm.js">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="icon-message-circle text-2xl text-white"></div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">ChatRizz</h1>
          <p className="text-[var(--text-secondary)]">
            {formData.inviterName ? (
              <span className="text-[var(--primary-color)] font-medium">
                {formData.inviterName} invited you to join ChatRizz!
              </span>
            ) : (
              isLogin ? 'Welcome back! Sign in to continue' : 'Create your account to get started'
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="auth-input"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="auth-input"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="auth-input"
            required
          />
          
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="auth-input"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-btn disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[var(--primary-color)] font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('AuthForm component error:', error);
    return null;
  }
}