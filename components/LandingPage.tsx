import React from 'react';
import { ShoppingBag, Info, ArrowRight, MapPin, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onEnter: () => void;
}

export const LandingPage: React.FC<Props> = ({ onEnter }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Brand Logo */}
      <div className={`p-5 rounded-3xl mb-6 shadow-xl ${isDarkMode ? 'bg-emerald-900/30' : 'bg-white'}`}>
        <ShoppingBag size={64} className="text-emerald-500" />
      </div>

      {/* Headlines */}
      <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Shelf Scout JA</h1>
      <p className={`text-lg mb-10 max-w-xs mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        The future of smart grocery shopping in Jamaica.
      </p>

      {/* The "Startup Status" Card */}
      <div className={`w-full max-w-md p-6 rounded-2xl text-left border shadow-sm mb-8 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Info size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Early Access Beta</h3>
            <p className={`text-sm leading-relaxed mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              We are a startup in our initial stages. Some features and locations are currently in testing.
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className={`space-y-3 p-4 rounded-xl text-sm ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50 border border-slate-100'}`}>
          
          {/* Live Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-medium">St. Catherine</span>
            </div>
            <span className="text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded">LIVE</span>
          </div>

          {/* Beta Status */}
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
              <span className={`font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Kgn & St. Andrew</span>
            </div>
            <span className="text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-0.5 rounded">BETA</span>
          </div>

        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onEnter}
        className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
      >
        Start Scouting <ArrowRight size={20} />
      </button>

      <p className={`text-xs mt-8 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
        Version 0.5.0 (Public Beta)
      </p>

    </div>
  );
};
