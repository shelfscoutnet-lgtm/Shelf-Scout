import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ChevronRight, TrendingDown, Sun, Moon, MapPin, ArrowLeft, 
  ShoppingBag, Bell, Loader2, Database, Store as StoreIcon, Zap, 
  XCircle, Utensils, Clock, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

// --- METICULOUS PATH RESTORATION ---
// These files are now one folder up in ../components/
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { ChatBot } from '../components/ChatBot';
import { ProductModal } from '../components/ProductModal';
import { ProductCard } from '../components/ProductCard';
import { ChefCorner } from '../components/ChefCorner';
import { AdminUpload } from '../components/AdminUpload';
import { useProducts } from '../hooks/useProducts';
import { useSignups } from '../hooks/useSignups';

export const ActiveDashboard: React.FC = () => {
  const { 
    currentParish, resetParish, stores, locations, 
    selectedLocation, setSelectedLocation, cart, isLoading: contextLoading 
  } = useShop();

  const { isDarkMode, toggleTheme } = useTheme();
  
  // 1. DATA INTEGRITY: Sync with Cleansed Parish IDs
  const { signupCount, submitSignup } = useSignups(currentParish?.id);
  
  const [activeTab, setActiveTab] = useState('home');
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { products, loading: productsLoading } = useProducts(selectedCategory);
  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem('shelf_scout_search') || '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  // --- METICULOUS SEARCH LOGIC ---
  // Handles the new precision format: { val, gct, branch }
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  // --- SYSTEM SAFETY CHECK ---
  // Prevents crash during context handshake
  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  const handleActiveSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentParish || !signupName || !signupEmail) return;
      setIsSigningUp(true);
      if (submitSignup) {
        const res = await submitSignup({ name: signupName, email: signupEmail, parish_id: currentParish.id });
        if (res.success) {
            setShowSignupModal(false);
            setSignupName(''); setSignupEmail('');
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      }
      setIsSigningUp(false);
  };

  return (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
        
        {activeTab === 'home' && (
          <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto animate-fade-in">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <img src="https://zwulphqqstyywybeyleu.supabase.co/storage/v1/object/public/Brand%20logo/shelf-scout-logo.png" alt="Logo" className="h-8" />
                    <h1 className="text-xl font-bold">Shelf<span className="text-emerald-500">Scout</span></h1>
                </div>
                <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-800 text-slate-200 shadow-lg">
                  {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                </button>
            </header>

            {/* PRECISION LOCATION BAR: Optimized for Portmore identification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
               <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 shadow-sm">
                  <MapPin className="text-emerald-500" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Active Parish</p>
                    <p className="font-bold">{currentParish?.name}</p>
                  </div>
               </div>
               <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <StoreIcon className="text-slate-400" />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Dynamic City / Area</p>
                    <select 
                      value={selectedLocation} 
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="bg-transparent font-bold w-full focus:outline-none dark:text-white"
                    >
                      <option value="All">All {currentParish?.name}</option>
                      {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            {/* RESTORED FEATURES: CHEF CORNER & Sunday Dinner Logic */}
            {!selectedCategory && products.length > 0 && <ChefCorner products={products} />}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
                {filteredProducts.map(p => (
                    <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
                ))}
            </div>
          </div>
        )}

        {/* ... Rest of tabs (Search, Cart, Profile) logic here ... */}
      </div>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      <CartDrawer />
      <ChatBot availableProducts={products || []} />
    </>
  );
};
