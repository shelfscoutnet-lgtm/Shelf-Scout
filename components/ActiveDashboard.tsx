import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, TrendingDown, Users, Moon, Sun, MapPin, ArrowLeft, Camera, Upload, Check, ShoppingBag, Wallet, Award, Heart, Trash2, Bell, Loader2, Database, AlertCircle, Store as StoreIcon, Save, Zap, XCircle, LogOut, Mail, Lock, X, Minus, Plus, Utensils, ChefHat, Clock } from 'lucide-react';
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
import { ImportPage } from './ImportPage';
import { AdminUpload } from './AdminUpload';
import { VelvetRopeWaitlist } from './VelvetRopeWaitlist';

export const ActiveDashboard: React.FC = () => {
  const { 
    currentParish, 
    resetParish,
    addMultipleToCart, 
    getCartTotal, 
    comparisonStore, 
    primaryStore, 
    priceAlerts, 
    stores,
    locations,
    selectedLocation,
    setSelectedLocation,
    cart,
    updateCartItemQuantity,
    removeFromCart
  } = useShop();

  const { isDarkMode, toggleTheme } = useTheme();
  
  console.log("DEBUG LOCATION:", selectedLocation);
  const signupsData = useSignups(currentParish?.id);
  const signupCount = signupsData ? (signupsData.signupCount || 0) : 0;
  const submitSignup = signupsData ? signupsData.submitSignup : undefined;

  const [activeTab, setActiveTab] = useState('home');
  const [showImportPage, setShowImportPage] = useState(false);
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const [userEmail, setUserEmail] = useState<string | null>(() => {
      try { return localStorage.getItem('shelf_scout_user_email'); } catch { return null; }
  });
  const [loginInput, setLoginInput] = useState('');

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { products, loading: isLoadingProducts, error: productsError } = useProducts(selectedCategory);
  
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
        return sessionStorage.getItem('shelf_scout_search') || '';
    } catch { return ''; }
  });

  useEffect(() => {
    if (window.location.hash === '#admin-upload') {
        setShowAdminUpload(true);
    }
  }, []);

  useEffect(() => {
    try {
        sessionStorage.setItem('shelf_scout_search', searchTerm);
    } catch (e) { console.error(e); }
  }, [searchTerm]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);

  const triggeredAlerts = useMemo(() => {
      if (!currentParish || isLoadingProducts || !products) return [];
      const alerts = [];
      const relevantStores = selectedLocation === 'All' 
        ? stores.filter(s => s.parish_id === currentParish.id)
        : stores.filter(s => s.location === selectedLocation && s.parish_id === currentParish.id);
      
      for (const alert of priceAlerts) {
          const product = products.find(p => p.id === alert.productId);
          if (product) {
              const productPrices = relevantStores.map(s => product.prices[s.id]).filter((p): p is number => p !== undefined);
              const lowestPrice = productPrices.length > 0 ? Math.min(...productPrices) : Infinity;
              
              if (lowestPrice <= alert.targetPrice && lowestPrice !== Infinity) {
                  alerts.push({ product, price: lowestPrice, target: alert.targetPrice });
              }
          }
      }
      return alerts;
  }, [priceAlerts, currentParish, products, isLoadingProducts, stores, selectedLocation]);

  useEffect(() => {
      if (activeTab === 'profile') {
          try {
              const saved = localStorage.getItem('shelf_scout_saved');
              if (saved) {
                  setSavedProductIds(JSON.parse(saved));
              }
          } catch (e) {
              console.error("Error loading saved items", e);
          }
      }
  }, [activeTab]);

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.tags.some(t => t.includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const savedProducts = useMemo(() => {
      if (!products || !Array.isArray(products)) return [];
      return products.filter(p => savedProductIds.includes(p.id));
  }, [products, savedProductIds]);

  const removeSavedItem = (id: string) => {
      const newSaved = savedProductIds.filter(pid => pid !== id);
      setSavedProductIds(newSaved);
      localStorage.setItem('shelf_scout_saved', JSON.stringify(newSaved));
  };

  const handleProductClick = (p: Product) => {
    setSelectedProduct(p);
  };

  const scrollToProducts = () => {
    const element = document.getElementById('product-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleActiveSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentParish || !signupName || !signupEmail) return;

      setIsSigningUp(true);
      if (submitSignup) {
        const res = await submitSignup({
            name: signupName,
            email: signupEmail,
            parish_id: currentParish.id
        });
        
        if (res.success) {
            setShowSignupModal(false);
            setSignupName('');
            setSignupEmail('');
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else {
            alert("Couldn't join. Please try again.");
        }
      }
      setIsSigningUp(false);
  };

  const goalTarget = 300;
  const rawCount = typeof signupCount === 'number' ? signupCount : 0;
  const progressPercent = Math.min((rawCount / goalTarget) * 100, 100);

  const { bestTotal, worstTotal, savings } = useMemo(() => {
    let best = 0;
    let worst = 0;
    cart.forEach(item => {
      const prices = Object.values(item.prices) as number[];
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        best += min * item.quantity;
        worst += max * item.quantity;
      }
    });
    return { bestTotal: best, worstTotal: worst, savings: worst - best };
  }, [cart]);

  const categories = [
      { name: 'Pantry', emoji: '🍚' },
      { name: 'Meat', emoji: '🥩' },
      { name: 'Produce', emoji: '🥬' },
      { name: 'Beverages', emoji: '🥤' },
      { name: 'Canned', emoji: '🥫' },
      { name: 'Bakery', emoji: '🍞' },
      { name: 'Dairy', emoji: '🥛' },
      { name: 'Frozen', emoji: '❄️' },
      { name: 'Snacks', emoji: '🍪' }
  ];

  const handleCategoryClick = (categoryName: string) => {
      setSearchTerm(''); 
      if (selectedCategory === categoryName) {
          setSelectedCategory(null); 
      } else {
          setSelectedCategory(categoryName);
      }
  };

  const renderHeader = () => {
    if (activeTab !== 'home') {
       return (
          <div className="flex justify-between items-center mb-4 pt-4 px-4">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex items-center text-sm font-semibold ${isDarkMode ? 'text-teal-200 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                  <ArrowLeft size={18} className="mr-1" /> Back to Home
              </button>
              <button 
                  onClick={toggleTheme} 
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-teal-800 text-teal-200' : 'bg-slate-100 text-slate-600'}`}
              >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
          </div>
       )
    }

    return (
        <div className="flex flex-col mb-4 pt-4 px-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <img 
                        src="https://zwulphqqstyywybeyleu.supabase.co/storage/v1/object/public/Brand%20logo/shelf-scout-logo.png" 
                        alt="Shelf Scout Logo" 
                        className="h-8 w-auto"
                    />
                    <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Shelf<span className="text-emerald-500">Scout</span>
                    </h1>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={toggleTheme} 
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-teal-800 text-teal-200' : 'bg-slate-100 text-slate-600'}`}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <button 
                        onClick={resetParish}
                        className={`p-2 mr-3 rounded-full border transition-colors ${isDarkMode ? 'bg-teal-900 border-teal-800 text-teal-200 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`}>Current Parish</div>
                        <div className={`font-bold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            <MapPin size={16} className="mr-1 text-emerald-500" />
                            {currentParish?.name}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <StoreIcon size={16} className={`mr-3 ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`} />
                <div className="flex-1">
                    <label className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`}>City / Area</label>
                    <select 
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className={`w-full bg-transparent font-bold text-sm focus:outline-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
                    >
                        <option value="All" className="text-slate-900">All {currentParish?.name}</option>
                        {locations.map(loc => (
                            <option key={loc} value={loc} className="text-slate-900">
                                {loc}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
  }

  if (showImportPage) {
    return <ImportPage onBack={() => setShowImportPage(false)} />;
  }

  if (showAdminUpload) {
    return <AdminUpload onBack={() => setShowAdminUpload(false)} />;
  }

  const renderContent = () => {
    // --- HOME TAB ---
    if (activeTab === 'home') {
        return (
            <div className="pb-24 relative">
                {renderHeader()}
                
                <div className="px-4 mb-6">
                    <div 
                        onClick={() => setShowSignupModal(true)}
                        className={`rounded-xl p-4 border relative overflow-hidden cursor-pointer transition-transform active:scale-[0.98] ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-slate-900 border-slate-800'}`}
                    >
                         <div className="flex justify-between items-end mb-2 relative z-10">
                             <div>
                                 <h3 className="text-white font-bold text-sm flex items-center">
                                     <Zap size={14} className="text-yellow-400 mr-1" fill="currentColor" />
                                     Community Goal
                                 </h3>
                                 <p className="text-slate-400 text-xs mt-0.5">Help us reach {goalTarget} local scouts!</p>
                             </div>
                             <div className="text-right">
                                 <div className="text-2xl font-bold text-white leading-none">{rawCount}</div>
                                 <div className="text-[10px] text-slate-400 uppercase font-bold">Joined</div>
                             </div>
                         </div>
                         
                         <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative z-10">
                             <div 
                                className="bg-gradient-to-r from-emerald-500 to-yellow-400 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${isNaN(progressPercent) ? 0 : progressPercent}%` }}
                             ></div>
                         </div>
                         
                         <div className="mt-3 relative z-10">
                             <div className="flex items-center justify-between">
                                 <span className="text-[10px] text-emerald-400 font-bold">
                                     {isNaN(progressPercent) ? '0' : progressPercent.toFixed(0)}% Complete
                                 </span>
                                 <span className="text-[10px] text-slate-400 flex items-center">
                                    Join the movement <ChevronRight size={10} className="ml-1" />
                                 </span>
                             </div>
                         </div>

                         <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
                    </div>
                </div>

                <div className="p-4 space-y-6 pt-0">
                    {triggeredAlerts.length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 animate-pulse">
                            <h4 className="text-xs font-bold text-emerald-800 flex items-center mb-1">
                                <Bell size={12} className="mr-1 fill-emerald-800" /> Price Drop Alert!
                            </h4>
                            {triggeredAlerts.slice(0, 2).map((alert, idx) => (
                                <div key={idx} className="text-xs text-emerald-700">
                                    <strong>{alert.product.name}</strong> is now ${alert.price} (Goal: ${alert.target})
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={`rounded-2xl p-6 shadow-xl relative overflow-hidden ${isDarkMode ? 'bg-teal-950' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                        <div className="relative z-10">
                            <h2 className={`font-bold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Welcome to {currentParish?.name}</h2>
                            <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Comparing prices across {selectedLocation === 'All' || selectedLocation.startsWith('All') ? `all of ${currentParish?.name}` : selectedLocation}.</p>
                            <button 
                                onClick={scrollToProducts}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-emerald-500/30"
                            >
                                Start Scouting
                            </button>
                        </div>
                    </div>

                    {!selectedCategory && products && products.length > 0 && (
                        <ChefCorner products={products} />
                    )}

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                Categories
                                {selectedCategory && <span className="ml-2 text-emerald-500 text-sm font-normal">({selectedCategory})</span>}
                            </h3>
                            {selectedCategory && (
                                <button 
                                    onClick={() => setSelectedCategory(null)}
                                    className="text-slate-400 text-xs font-semibold flex items-center hover:text-red-500 transition-colors"
                                >
                                    <XCircle size={14} className="mr-1" /> Clear Filter
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map(cat => {
                                const isActive = selectedCategory === cat.name;
                                return (
                                    <button 
                                        key={cat.name}
                                        onClick={() => handleCategoryClick(cat.name)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border shadow-sm transition-all duration-200 ${
                                            isActive 
                                            ? 'bg-emerald-500 border-emerald-600 text-white transform scale-105 ring-2 ring-emerald-200' 
                                            : (isDarkMode ? 'bg-teal-900 border-teal-800 hover:border-emerald-500' : 'bg-white border-slate-100 hover:border-emerald-200')
                                        }`}
                                    >
                                        <span className="text-2xl mb-1">{cat.emoji}</span>
                                        <span className={`text-[10px] font-medium ${isActive ? 'text-white' : (isDarkMode ? 'text-teal-200' : 'text-slate-600')}`}>{cat.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div id="product-list">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                {selectedCategory ? `${selectedCategory} Deals` : 'Best Deals Nearby'}
                            </h3>
                            <button onClick={() => setActiveTab('search')} className="text-emerald-500 text-xs font-semibold flex items-center">
                                See All <ChevronRight size={14} />
                            </button>
                        </div>
                        
                        {isLoadingProducts ? (
                             <div className="flex justify-center py-12">
                                 <Loader2 className="animate-spin text-emerald-500" size={32} />
                             </div>
                        ) : products && products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    {products.map(p => (
                                        <ProductCard 
                                            key={p.id} 
                                            product={p} 
                                            onClick={() => handleProductClick(p)}
                                        />
                                    ))}
                                </div>
         <div className="mt-10 py-6 border-t border-slate-200 text-center">
          <div className="flex justify-center space-x-6 text-sm text-slate-500">
            {/* Privacy Policy Button */}
            <button 
              className="hover:text-emerald-600 transition-colors" 
              onClick={() => setShowPrivacy(true)}
            >
              Privacy Policy
            </button>

            {/* Contact Support Link */}
            <a 
              href="mailto:info@shelfscoutja.com" 
              className="hover:text-emerald-600 transition-colors"
            >
              Contact Support
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-2">© 2025 Shelf Scout Jamaica</p>
        </div>
                            </>
                        ) : (
                            <div className={`text-center py-8 border-2 border-dashed rounded-xl ${isDarkMode ? 'border-teal-800' : 'border-slate-200'}`}>
