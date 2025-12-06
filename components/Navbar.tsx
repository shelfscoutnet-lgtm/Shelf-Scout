import React from 'react';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { cart, isCartAnimating } = useShop();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'cart', icon: ShoppingBag, label: 'Cart', badge: cart.length > 0 ? cart.length : null },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isCart = item.id === 'cart';
            
            return (
                <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 relative"
                >
                    <div className={`transition-all duration-300 ${isActive ? 'text-emerald-600' : 'text-slate-400'} ${isCart && isCartAnimating ? 'scale-125 text-emerald-500 animate-bounce' : ''}`}>
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        {item.badge && (
                            <span className="absolute top-2 right-6 min-w-[16px] h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                                {item.badge}
                            </span>
                        )}
                    </div>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {item.label}
                    </span>
                </button>
            );
        })}
      </div>
    </div>
  );
};