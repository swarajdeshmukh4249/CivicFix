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
    return (
      <div className="min-h-screen bg-[var(--background)]" data-name="app" data-file="app.js">
        <Header />
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-[var(--foreground)] leading-tight tracking-tight">
                Motion
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-pink-400 via-yellow-400 to-green-400 bg-clip-text text-transparent mb-2">
                Smart Note-Taking for Modern Teams
              </h2>
            </div>
              <p className="text-xl text-[var(--secondary-color)] max-w-3xl mx-auto leading-relaxed">
                Transform your productivity with AI-powered note-taking that adapts to how you think and work. 
                Capture ideas, organize thoughts, and collaborate seamlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <button className="btn btn-black px-8 py-3 text-lg font-semibold rounded-xl">
                  Start Free Trial
                </button>
                <button className="btn px-8 py-3 text-lg font-semibold rounded-xl border-2 border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                  Watch Demo
                </button>
              </div>
            </div>
            <GlowingEffectDemoSecond />
          </div>
        </main>
        <Footer />
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