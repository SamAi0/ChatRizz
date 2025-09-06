class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [selectedChat, setSelectedChat] = React.useState(null);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
    const [user, setUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      // Initialize theme
      initializeTheme();
      
      // Check authentication
      const checkAuth = async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          window.location.href = 'auth.html';
          return;
        }
        setUser(currentUser);
        
        // Initialize WebSocket connection
        initializeSocket(currentUser);
        
        setLoading(false);
      };
      
      checkAuth();
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        disconnectSocket();
      };
    }, []);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--secondary-color)]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--text-secondary)]">Loading ChatRizz...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[var(--secondary-color)] flex flex-col" data-name="app" data-file="app.js">
        <Header user={user} />
        
        <div className="flex-1 flex">
          {/* Sidebar */}
          {(!isMobile || !selectedChat) && (
            <div className={`${isMobile ? 'w-full' : 'w-[var(--sidebar-width)]'} bg-white border-r border-[var(--border-color)] flex-shrink-0`}>
              <Sidebar 
                selectedChat={selectedChat} 
                setSelectedChat={setSelectedChat}
                isMobile={isMobile}
                user={user}
              />
            </div>
          )}

          {/* Chat Area */}
          {(!isMobile || selectedChat) && (
            <div className="flex-1 flex flex-col">
              <ChatArea 
                selectedChat={selectedChat} 
                setSelectedChat={setSelectedChat}
                isMobile={isMobile}
                user={user}
              />
            </div>
          )}

          {/* Welcome Screen */}
          {!selectedChat && !isMobile && (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-20 h-20 bg-[var(--primary-color)] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="icon-message-circle text-3xl text-[var(--primary-color)]"></div>
                </div>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Welcome to ChatRizz</h2>
                <p className="text-[var(--text-secondary)]">Select a chat to start messaging with automatic translation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);