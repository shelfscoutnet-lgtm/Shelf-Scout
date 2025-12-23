import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PARISHES } from '../constants';
import { useTheme } from '../context/ThemeContext';

export const ParishSelectionScreen: React.FC = () => {
  const { setCurrentParish } = useShop();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDarkMode ? 'bg-teal-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <img 
                src="https://zwulphqqstyywybeyleu.supabase.co/storage/v1/object/public/Brand%20logo/shelf-scout-logo.png" 
                alt="Shelf Scout Logo" 
                className="h-12 w-auto"
            />
            <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Shelf<span className="text-emerald-500">Scout</span>
            </h1>
          </div>
          <p className={`${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>
            Compare grocery prices across Jamaica.
          </p>
        </div>

        <div className={`bg-white rounded-2xl shadow-xl p-6 border ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100'}`}>
          <label className={`block text-xs font-bold uppercase mb-3 tracking-wider ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>
            Select Your Parish
          </label>
          
          <div className="space-y-2 max-h-[60vh] overflow-y-auto hide-scrollbar">
            {PARISHES.map(parish => (
              <button
                key={parish.id}
                onClick={() => setCurrentParish(parish)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${
                  isDarkMode 
                    ? 'bg-teal-950 border-teal-800 hover:border-emerald-500 hover:bg-emerald-900/20' 
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors ${
                    isDarkMode ? 'bg-teal-800 text-teal-400 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-white border border-slate-200 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500'
                  }`}>
                    <MapPin size={16} />
                  </div>
                  <div className="text-left">
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {parish.name}
                    </div>
                    {parish.tier !== 'active' && parish.id !== 'st-catherine' && (
                        <div className="text-[10px] text-emerald-500 font-medium">Coming Soon</div>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-8">
            Select a location to see local prices and availability.
        </p>
      </div>
    </div>
  );
};
