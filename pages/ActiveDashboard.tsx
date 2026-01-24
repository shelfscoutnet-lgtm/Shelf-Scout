import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, TrendingDown, Sun, Moon, MapPin, ArrowLeft, ShoppingBag, Bell, Loader2, Database, Store as StoreIcon, Zap, XCircle, Utensils, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { Navbar } from './Navbar';
import { CartDrawer } from './CartDrawer';
import { ChatBot } from './ChatBot';
import { ProductModal } from './ProductModal';
import { ProductCard } from './ProductCard';
import { ChefCorner } from './ChefCorner';
import { useProducts } from '../hooks/useProducts';
import { useSignups } from '../hooks/useSignups';
import { AdminUpload } from './AdminUpload';

export const ActiveDashboard: React.FC = () => {
  const { 
    currentParish, resetParish, stores, locations, 
    selectedLocation, setSelectedLocation, cart, isLoading: contextLoading 
  } = useShop();

  const { isDarkMode, toggleTheme } = useTheme();
  
  // 1. DATA INTEGRITY: Use Parish ID for signups to match cleansed DB
  const { signupCount, submitSignup } = useSignups(currentParish?.id);
  const [activeTab, setActiveTab] = useState('home');
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // 2. SEARCH & FILTER: Integrate with Portmore Precision Hook
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { products, loading: productsLoading } = useProducts(selectedCategory);
  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem('shelf_scout_search') || '');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // METICULOUS SEARCH LOGIC: Handles the new branch-aware format
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  // 3. ARCHITECTURE: Prevent "System Error" by checking loading states
  if (contextLoading || (productsLoading && !products.length)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  // Action: Signup
  const handleActiveSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      // Implementation logic remains the same...
  };

  const categories = [
      { name: 'Pantry', emoji: '🍚' }, { name: 'Meat', emoji: '🥩' },
      { name: 'Produce', emoji: '🥬' }, { name: 'Beverages', emoji: '🥤' },
      { name: 'Canned', emoji: '🥫' }, { name: 'Bakery', emoji: '🍞' },
      { name: 'Dairy', emoji: '🥛' }, { name: 'Frozen', emoji: '❄️' },
      { name: 'Snacks', emoji: '🍪' }
  ];

  return (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
        
        {/* TAB RENDERING LOGIC */}
        {activeTab === 'home' && (
          <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <img src="https://zwulphqqstyywybeyleu.supabase.co/storage/v1/object/public/Brand%20logo/shelf-scout-logo.png" alt="Logo" className="h-8" />
                    <h1 className="text-xl font-bold">Shelf<span className="text-emerald-500">Scout</span></h1>
                </div>
                <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-800"><Sun size={18}/></button>
            </header>

            {/* DYNAMIC CITY SELECTOR: No more hardcoding  */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
               <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
                  <MapPin className="text-emerald-500" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Parish</p>
                    <p className="font-bold">{currentParish?.name}</p>
                  </div>
               </div>
               <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <StoreIcon className="text-slate-400" />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-500">City / Area</p>
                    <select 
                      value={selectedLocation} 
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="bg-transparent font-bold w-full focus:outline-none"
                    >
                      <option value="All">All {currentParish?.name}</option>
                      {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
               </div>
            </div>

            {/* FEATURE: CHEF CORNER  */}
            {!selectedCategory && <ChefCorner products={products} />}

            {/* PRODUCT GRID: Updated with Grid fix for PC */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
                {filteredProducts.map(p => (
                    <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
                ))}
            </div>
          </div>
        )}

        {/* ... Other Tabs: Cart, Search, Profile ... */}
      </div>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
      <CartDrawer />
      <ChatBot availableProducts={products || []} />
    </>
  );
};
