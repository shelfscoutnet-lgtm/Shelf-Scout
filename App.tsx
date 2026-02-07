import React, { useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { RegionGuard } from './components/RegionGuard';
import { BetaBanner } from './components/BetaBanner';
import { LandingPage } from './components/LandingPage';
import { ReviewOrder } from './components/ReviewOrder'; // Import Meticulous Component

/**
 * METICULOUS ERROR BOUNDARY: Catch rendering errors across the app
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() { return { hasError: true }; }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900 text-center">
          <div className="bg-red-100 p-6 rounded-full mb-6">
            <AlertCircle className="text-red-600" size={48} />
          </div>
          <h1 className="text-2xl font-bold mb-2">System Error</h1>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">
            Shelf Scout encountered a data-syncing issue. This typically happens during regional data transitions.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Reconnect to Scout
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ShopProvider>
          {!hasEntered ? (
            <LandingPage onEnter={() => setHasEntered(true)} />
          ) : (
            /* METICULOUS LAYOUT CONTAINER  */
            <div className="flex flex-col min-h-screen relative">
              <BetaBanner />
              
              <main className="flex-1 pb-32"> {/* Added padding for the ReviewOrder bar */}
                <RegionGuard />
              </main>

              {/* METICULOUS PLACEMENT: ReviewOrder is inside ShopProvider 
                and rendered as an overlay [cite: 160] 
              */}
              <ReviewOrder />
            </div>
          )}
        </ShopProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
