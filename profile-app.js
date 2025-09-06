class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <button onClick={() => window.location.reload()}>Reload Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProfileApp() {
  try {
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        window.location.href = 'auth.html';
        return;
      }
      setUser(currentUser);
    }, []);

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[var(--secondary-color)]" data-name="profile-app">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <ProfileSettings user={user} setUser={setUser} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProfileApp error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <ProfileApp />
  </ErrorBoundary>
);