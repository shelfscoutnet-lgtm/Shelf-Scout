import React from 'react';
import { Home, Search, ShoppingBag, Utensils, Shield } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { cartItemCount } = useShop();
  const { isDarkMode } = useTheme();
  const adminEnabled = import.meta.env.VITE_ADMIN_MODE === 'true';

  return (
    <div className={`fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-50 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      
      <button 
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center justify-center w-16 ${activeTab === 'home' ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}
      >
        <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">Home</span>
      </button>

      <button 
        onClick={() => setActiveTab('search')}
        className={`flex flex-col items-center justify-center w-16 ${activeTab === 'search' ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}
      >
        <Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">Search</span>
      </button>

      <button 
        onClick={() => setActiveTab('cart')}
        className={`flex flex-col items-center justify-center w-16 relative ${activeTab === 'cart' ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}
      >
        <div className="relative">
          <ShoppingBag size={24} strokeWidth={activeTab === 'cart' ? 2.5 : 2} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cartItemCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium mt-1">Cart</span>
      </button>

      {/* UPDATED BUTTON: Profile -> Recipes */}
      <button 
        onClick={() => setActiveTab('profile')} 
        className={`flex flex-col items-center justify-center w-16 ${activeTab === 'profile' ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}
      >
        <Utensils size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
        <span className="text-[10px] font-medium mt-1">Recipes</span>
      </button>

      {adminEnabled && (
        <button 
          onClick={() => setActiveTab('admin')} 
          className={`flex flex-col items-center justify-center w-16 ${activeTab === 'admin' ? 'text-emerald-500' : (isDarkMode ? 'text-slate-500' : 'text-slate-400')}`}
        >
          <Shield size={24} strokeWidth={activeTab === 'admin' ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Admin</span>
        </button>
      )}

    </div>
  );
};
