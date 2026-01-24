import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ChevronRight, TrendingDown, Sun, Moon, MapPin, ArrowLeft, 
  ShoppingBag, Bell, Loader2, Database, Store as StoreIcon, Zap, 
  XCircle, Plus, Minus, Trash2, Utensils, Clock 
} from 'lucide-react';
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

export const ActiveDashboard: React.FC = () => {
  const { 
    currentParish, 
    resetParish,
    getCartTotal, 
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
  
  // Data & State
  const signupsData = useSignups(currentParish?.id);
  const signupCount = signupsData ? (signupsData.signupCount || 0) : 0;
  const submitSignup = signupsData ? signupsData.submitSignup : undefined;

  const [activeTab, setActiveTab] = useState('home');
  const [showImportPage, setShowImportPage] = useState(false);
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // Auth State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { products, loading: isLoadingProducts, error: productsError } = useProducts(selectedCategory);
  
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
        return sessionStorage.getItem('shelf_scout_search') || '';
    } catch { return ''; }
  });

  // Effects
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

  // Product Logic
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    return products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.tags.some(t => t.includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

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

  // Cart Calculations
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

  // Actions
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

  const handleCategoryClick = (categoryName: string) => {
      setSearchTerm(''); 
      if (selectedCategory === categoryName) {
          setSelectedCategory(null); 
      } else {
          setSelectedCategory(categoryName);
      }
  };

  // Constants
  const goalTarget = 300;
  const rawCount = typeof signupCount === 'number' ? signupCount : 0;
  const progressPercent = Math.min((rawCount / goalTarget) * 100, 100);

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

  // Helper Renders
  const renderHeader = () => {
    if (activeTab !== 'home') {
       return (
          <div className="flex justify-between items-center mb-4 pt-4 px-4">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex items-center text-sm font-semibold ${isDarkMode ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                  <ArrowLeft size={18} className="mr-1" /> Back to Home
              </button>
              <button 
                  onClick={toggleTheme} 
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'}`}
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
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'}`}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <button 
                        onClick={resetParish}
                        className={`p-2 mr-3 rounded-full border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <div className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Current Parish</div>
                        <div className={`font-bold text-lg flex items-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            <MapPin size={16} className="mr-1 text-emerald-500" />
                            {currentParish?.name}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <StoreIcon size={16} className={`mr-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                <div className="flex-1">
                    <label className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>City / Area</label>
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

  // --- Main Render Logic ---

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
                    {/* Goal Card */}
                    <div 
                        onClick={() => setShowSignupModal(true)}
                        className={`rounded-xl p-4 border relative overflow-hidden cursor-pointer transition-transform active:scale-[0.98] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-slate-800'}`}
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

                    <div className={`rounded-2xl p-6 shadow-xl relative overflow-hidden ${isDarkMode ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
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
                                            : (isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-emerald-500' : 'bg-white border-slate-100 hover:border-emerald-200')
                                        }`}
                                    >
                                        <span className="text-2xl mb-1">{cat.emoji}</span>
                                        <span className={`text-[10px] font-medium ${isActive ? 'text-white' : (isDarkMode ? 'text-slate-200' : 'text-slate-600')}`}>{cat.name}</span>
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
                                {/* GRID FIX FOR PC: Added lg:grid-cols-4 xl:grid-cols-5 */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                                        <button 
                                        className="hover:text-emerald-600 transition-colors" 
                                        onClick={() => setShowPrivacy(true)}
                                        >
                                        Privacy Policy
                                        </button>

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
                            <div className={`text-center py-8 border-2 border-dashed rounded-xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                                 <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                                     {selectedCategory 
                                        ? `No products found in "${selectedCategory}".` 
                                        : "Inventory empty. Use the Import Tool in Profile."}
                                 </p> 
                                 {selectedCategory && (
                                     <button 
                                        onClick={() => setSelectedCategory(null)}
                                        className="mt-2 text-xs font-bold text-emerald-500"
                                     >
                                          Clear Filter
                                     </button>
                                 )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    // --- CART TAB ---
    if (activeTab === 'cart') {
        return (
            <div className="p-4 pb-24 min-h-screen flex flex-col">
                {renderHeader()}
                {cart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                        <div className="text-center max-w-xs">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                <ShoppingBag className="text-slate-300" size={32} />
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Your Basket is Empty</h2>
                            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Add items to your scout list to compare prices across local stores.</p>
                            <button 
                                onClick={() => setActiveTab('home')}
                                className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold w-full shadow-lg hover:bg-emerald-500"
                            >
                                Start Scouting
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-fade-in overflow-hidden">
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {cart.map(item => {
                                const itemStoreId = item.selectedStoreId || primaryStore?.id;
                                const unitPrice = itemStoreId ? item.prices[itemStoreId] || 0 : 0;
                                return (
                                    <div key={item.id} className={`flex items-center p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                        <div className="w-16 h-16 rounded-lg bg-white p-1 mr-4 flex-shrink-0">
                                            <img src={item.image_url} className="h-full w-full object-contain mix-blend-multiply" alt=""/>
                                        </div>
                                        <div className="flex-1 min-w-0 mr-2">
                                            <h4 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</h4>
                                            <div className="text-xs font-bold text-emerald-500">
                                                ${(unitPrice * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center rounded-full border border-slate-200 overflow-hidden h-8">
                                                <button onClick={() => updateCartItemQuantity(item.id, -1)} className="px-2 hover:bg-slate-100"><Minus size={14}/></button>
                                                <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                                <button onClick={() => updateCartItemQuantity(item.id, 1)} className="px-2 hover:bg-slate-100"><Plus size={14}/></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-rose-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        
                        {/* Summary Section */}
                        <div className={`mt-6 p-6 rounded-2xl border-t-4 border-emerald-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white shadow-xl'}`}>
                             <div className="flex justify-between items-center mb-1 text-slate-400 line-through text-sm">
                                 <span>Worst Total</span>
                                 <span>${worstTotal.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center mb-1 text-sm font-semibold">
                                 <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Best Possible Total</span>
                                 <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>${bestTotal.toLocaleString()}</span>
                             </div>
                             {savings > 0 && (
                                <div className="flex justify-between items-center mb-4 py-2 border-y border-emerald-500/20">
                                    <span className="text-emerald-500 font-bold flex items-center">
                                        <TrendingDown size={18} className="mr-1" /> Potential Savings
                                    </span>
                                    <span className="text-xl font-extrabold text-emerald-500">
                                        -${savings.toLocaleString()}
                                    </span>
                                </div>
                             )}
                             <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-colors">
                                 Finalize Scouting List
                             </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // --- RECIPES / KITCHEN TAB ---
    if (activeTab === 'profile') {
        return (
            <div className={`min-h-screen pb-24 px-6 pt-12 flex flex-col items-center justify-center text-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
                
                {/* Hero Icon */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}>
                  <Utensils size={48} />
                </div>
          
                {/* Main Text */}
                <h1 className="text-3xl font-bold mb-4">The Shelf Scout Kitchen</h1>
                <p className={`text-lg mb-8 max-w-xs mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  We're cooking up something special! Soon you'll be able to turn your grocery list into delicious Jamaican meals.
                </p>
          
                {/* Feature Preview Cards */}
                <div className="w-full max-w-sm space-y-4 mb-10">
                  <div className={`p-4 rounded-xl flex items-center text-left ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mr-4">
                          <Utensils size={20} />
                      </div>
                      <div>
                          <h3 className="font-bold text-sm">Budget Meals</h3>
                          <p className="text-xs text-slate-500">Recipes tailored to current store deals.</p>
                      </div>
                  </div>
          
                  <div className={`p-4 rounded-xl flex items-center text-left ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-4">
                          <Clock size={20} />
                      </div>
                      <div>
                          <h3 className="font-bold text-sm">Quick Fixes</h3>
                          <p className="text-xs text-slate-500">Dinner on the table in under 30 mins.</p>
                      </div>
                  </div>
                </div>
          
                {/* Dynamic Parish Notice */}
                <div className={`text-xs px-6 py-3 rounded-full ${isDarkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-500'}`}>
                  Recipe features coming to {currentParish?.name || 'your area'} soon.
                </div>
            </div>
        );
    }

    if (activeTab === 'search') {
        return (
            <div className="p-4 pb-24 min-h-screen">
                {renderHeader()}
                <div className={`sticky top-0 z-20 pb-4 pt-2 ${isDarkMode ? 'bg-slate-950' : 'bg-[#f8fafc]'}`}>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Search products..."
                          className={`w-full border rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-600' : 'bg-white border-slate-200'}`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          autoFocus
                        />
                      </div>
                      
                      <div className="flex space-x-2 overflow-x-auto hide-scrollbar mt-4">
                        {['All', 'Sunday Dinner', 'Survival', 'Pantry'].map((tag, i) => (
                            <button 
                                key={tag}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-emerald-600 text-white' : (isDarkMode ? 'bg-slate-900 border border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-600')}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
                
                {!isLoadingProducts && (!products || products.length === 0) && !productsError && (
                    <div className={`mt-8 p-6 rounded-2xl text-center ${isDarkMode ? 'bg-slate-900/50' : 'bg-emerald-50'}`}>
                         <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                             <Database className="text-emerald-600" size={24} />
                         </div>
                         <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Connected to Supabase!</h3>
                         <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>No products found yet.</p>
                         <button 
                            onClick={() => setShowImportPage(true)}
                            className="mt-4 text-xs font-bold text-emerald-600 bg-white border border-emerald-200 px-4 py-2 rounded-full shadow-sm"
                         >
                             Import Data Now
                         </button>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onClick={() => handleProductClick(product)}
                        />
                    ))}
                </div>
                {filteredProducts.length === 0 && products && products.length > 0 && (
                    <div className="text-center mt-20 text-slate-400">
                        <p>No items found matching "{searchTerm}".</p>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
    );
  };

  return (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
        {renderContent()}
      </div>

      {showSignupModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                 <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-3xl"></div>
                     <Zap size={48} className="text-white relative z-10 drop-shadow-lg" fill="currentColor" />
                     <button 
                        onClick={() => setShowSignupModal(false)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-md"
                     >
                         <X size={20} />
                     </button>
                 </div>

                 <div className="p-8">
                     <div className="text-center mb-6">
                         <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Join the Movement</h2>
                         <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                             Help us grow! Join the Shelf Scout community for updates and exclusive deals in <span className="font-bold text-emerald-500">{currentParish?.name}</span>.
                         </p>
                     </div>

                     <form onSubmit={handleActiveSignup} className="space-y-4">
                         <div>
                             <input 
                                 type="text" 
                                 value={signupName}
                                 onChange={(e) => setSignupName(e.target.value)}
                                 placeholder="Your Name"
                                 className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-600' : 'border-slate-200 bg-slate-50'}`}
                                 required
                             />
                         </div>
                         <div>
                             <input 
                                 type="email" 
                                 value={signupEmail}
                                 onChange={(e) => setSignupEmail(e.target.value)}
                                 placeholder="Email Address"
                                 className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-600' : 'border-slate-200 bg-slate-50'}`}
                                 required
                             />
                         </div>

                         <button 
                            type="submit"
                            disabled={isSigningUp}
                            className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02]"
                         >
                             {isSigningUp ? 'Joining...' : 'Count Me In! 🎉'}
                         </button>
                     </form>
                     <p className="text-center text-[10px] text-slate-400 mt-4">
                         No spam. Just savings.
                     </p>
                 </div>
            </div>
        </div>
      )}
      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
            
            {/* Close Button (Top Right) */}
            <button 
              onClick={() => setShowPrivacy(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-2 text-slate-800">Privacy Policy for Shelf Scout</h2>
            <p className="text-sm text-slate-500 mb-6 italic border-b pb-4">Effective Date: December 14, 2025</p>

            <div className="text-sm text-slate-600 space-y-6 text-left">
              
              <section>
                <h3 className="font-bold text-slate-900 text-lg mb-2">1. Introduction & Compliance with Jamaican Law</h3>
                <p className="mb-2">
                  Shelf Scout ("we," "us," or "our") respects the privacy of our users ("you" or "Data Subject") and is committed to protecting your personal data in accordance with the <strong>Data Protection Act, 2020 (the "DPA") of Jamaica.</strong>
                </p>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mt-3">
                  <p className="font-semibold text-xs uppercase text-emerald-600 mb-1">Data Controller Identity</p>
                  <p className="font-medium text-slate-800">Shelf Scout</p>
                  <p>Watchwell, Watchwell P.A.</p>
                  <p>St. Elizabeth, Jamaica</p>
                  <p className="mt-1">Email: <a href="mailto:info@shelfscoutja.com" className="text-emerald-700 underline">info@shelfscoutja.com</a></p>
                </div>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-lg mb-2">2. The Personal Data We Collect</h3>
                <ul className="list-disc pl-5 space-y-1 marker:text-emerald-500">
                  <li><strong>Identity Data:</strong> Name, username (if you register).</li>
                  <li><strong>Contact Data:</strong> Email address (for newsletters or account management).</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, and location data (e.g., distinguishing Hilo Spanish Town vs. Kingston).</li>
                  <li><strong>Usage Data:</strong> Which grocery products you search for and click on.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-lg mb-2">3. Lawful Basis for Processing</h3>
                <p className="mb-2">Under Jamaican law, we rely on the following:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-emerald-500">
                  <li><strong>Consent:</strong> Explicit agreement for newsletters/cookies.</li>
                  <li><strong>Performance of a Contract:</strong> Providing requested services (e.g., saving lists).</li>
                  <li><strong>Legitimate Interests:</strong> Improving security and preventing fraud.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-lg mb-2">4. How We Use Your Data</h3>
                <p>We use your data to compare grocery prices, manage accounts, deliver alerts, and attribute affiliate commissions (via Amazon Associates).</p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-lg mb-2">5. International Transfers (Tech Stack)</h3>
                <p>
                  We utilize third-party cloud service providers (Google Firebase/Supabase). While Shelf Scout is based in Jamaica, your data may be stored on secure servers abroad. By using our services, you consent to this transfer.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-lg mb-2">6. Disclosure to Third Parties</h3>
                <p>
                  We do not sell your personal data. We share strict operational data with Service Providers (Google Cloud), Analytics Providers, or legal authorities (Jamaican Constabulary Force/Courts) if required.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-lg mb-2">7. Your Rights Under the Jamaican DPA</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Right to be Informed</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Right of Access</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Right to Rectification</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Right to Erasure</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Right to Restrict Processing</li>
                  <li className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span>Right to Data Portability</li>
                </ul>
                <p className="mt-2 text-xs">To exercise these rights, contact <a href="mailto:info@shelfscoutja.com" className="text-emerald-600 hover:underline">info@shelfscoutja.com</a>.</p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-lg mb-2">8. Affiliate Disclosure</h3>
                <p>
                  Shelf Scout uses affiliate links, including the Amazon Associates Program. Clicking links and making purchases may result in us earning a commission at no extra cost to you.
                </p>
              </section>

               <section>
                <h3 className="font-bold text-slate-900 text-lg mb-2">9. Data Retention & OIC</h3>
                <p>
                  We retain data only as long as necessary. You have the right to complain to the Office of the Information Commissioner (OIC) in Jamaica, but we appreciate the chance to resolve concerns first.
                </p>
              </section>

            </div>

            {/* Bottom Close Button */}
            <div className="sticky bottom-0 bg-white pt-4 border-t mt-6">
              <button 
                onClick={() => setShowPrivacy(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
        />
      )}

      <CartDrawer />

      <ChatBot availableProducts={products || []} />
    </>
  );
};
