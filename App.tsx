import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { ParishGuard } from './components/ParishGuard';
import { BetaBanner } from './components/BetaBanner';

/**
 * Error Boundary component to catch rendering errors and prevent blank screens.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

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
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            The application encountered an unexpected issue. This could be due to missing configuration or a temporary connection failure.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
            >
              <RefreshCw size={18} />
              Refresh Application
            </button>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              Please check the developer console for details
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ShopProvider>
          <div className="flex flex-col min-h-screen">
            <BetaBanner />
            <ParishGuard />
            {/* FOOTER START */}
      <footer className="mt-12 py-6 text-center text-gray-500 text-sm border-t border-gray-200 mb-24">
        <p>© 2025 Shelf Scout JA. All rights reserved.</p>
       <div className="flex flex-col gap-2 mt-2">
  <a href="/privacy.html" className="hover:text-green-600 underline">Privacy Policy</a>
  <span className="text-gray-400">
    Need help? Email us: <a href="mailto:shelfscoutja@gmail.com" className="text-green-600 font-bold hover:underline">shelfscoutja@gmail.com</a>
  </span>
        </div>
      </footer>
      {/* FOOTER END */}
          </div>
        </ShopProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
