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

function AuthApp() {
  try {
    React.useEffect(() => {
      // Redirect if already logged in
      if (getCurrentUser()) {
        window.location.href = 'index.html';
      }
    }, []);

    return (
      <div className="min-h-screen flex items-center justify-center p-4" data-name="auth-app">
        <AuthForm />
      </div>
    );
  } catch (error) {
    console.error('AuthApp error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AuthApp />
  </ErrorBoundary>
);