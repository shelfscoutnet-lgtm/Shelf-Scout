import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, TrendingDown, Users, Moon, Sun, MapPin, ArrowLeft, Camera, Upload, Check, ShoppingBag, Wallet, Award, Heart, Trash2, Bell } from 'lucide-react';
import { PRODUCTS, PARISHES, MEAL_BUNDLES, STORES } from '../constants';
import { ProductCard } from './ProductCard';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { Navbar } from './Navbar';
import { CartDrawer } from './CartDrawer';
import { ChatBot } from './ChatBot';
import { ProductModal } from './ProductModal';
import { Product } from '../types';

export const ActiveDashboard: React.FC = () => {
  const { currentParish, manualOverride, addMultipleToCart, getCartTotal, comparisonStore, primaryStore, priceAlerts } = useShop();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  
  // Persistent Search Term
  const [searchTerm, setSearchTerm] = useState(() => {
    try {
        return sessionStorage.getItem('shelf_scout_search') || '';
    } catch { return ''; }
  });

  // Update session storage when search changes
  useEffect(() => {
    try {
        sessionStorage.setItem('shelf_scout_search', searchTerm);
    } catch (e) { console.error(e); }
  }, [searchTerm]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Profile / Catalogue Form State
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemSubmitted, setItemSubmitted] = useState(false);
  
  // Saved Items State
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);

  // Notifications for Alerts
  const triggeredAlerts = useMemo(() => {
      if (!currentParish) return [];
      const alerts = [];
      const parishStores = STORES.filter(s => s.parish_id === currentParish.id);
      
      for (const alert of priceAlerts) {
          const product = PRODUCTS.find(p => p.id === alert.productId);
          if (product) {
              // Check prices in current parish
              const lowestPrice = Math.min(...parishStores.map(s => product.prices[s.id] || Infinity));
              if (lowestPrice <= alert.targetPrice) {
                  alerts.push({ product, price: lowestPrice, target: alert.targetPrice });
              }
          }
      }
      return alerts;
  }, [priceAlerts, currentParish]);

  // Load Saved Items when Profile tab is active
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

  const filteredProducts = PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.tags.some(t => t.includes(searchTerm.toLowerCase()))
  );

  const savedProducts = PRODUCTS.filter(p => savedProductIds.includes(p.id));

  const handleAddBundle = (productIds: string[]) => {
    const productsToAdd = PRODUCTS.filter(p => productIds.includes(p.id));
    addMultipleToCart(productsToAdd);
    // Visual feedback handled by cart drawer updating
  };

  const removeSavedItem = (id: string) => {
      const newSaved = savedProductIds.filter(pid => pid !== id);
      setSavedProductIds(newSaved);
      localStorage.setItem('shelf_scout_saved', JSON.stringify(newSaved));
  };

  // Calculate Personal Stats for Profile
  const totalSpend = getCartTotal(primaryStore?.id);
  const comparisonSpend = getCartTotal(comparisonStore?.id);
  const totalSaved = Math.max(0, comparisonSpend - totalSpend);

  const renderHeader = () => {
    if (activeTab !== 'home') {
       return (
          <div className="flex justify-between items-center mb-4">
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
        <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
                <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Shelf<span className="text-emerald-500">Scout</span>
                </h1>
                <div className="flex items-center mt-1">
                        <MapPin size={12} className={`mr-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <select 
                        value={currentParish?.id}
                        onChange={(e) => manualOverride(e.target.value)}
                        className={`text-xs font-semibold bg-transparent border-none p-0 focus:ring-0 cursor-pointer ${isDarkMode ? 'text-teal-200' : 'text-slate-700'}`}
                        >
                        {PARISHES.map(p => (
                            <option key={p.id} value={p.id} className="text-slate-900">
                                {p.name}
                            </option>
                        ))}
                        </select>
                </div>
            </div>
            
            <div className="flex items-center space-x-2">
                {/* Alert Bell */}
                <div className="relative">
                    <button className={`p-2 rounded-full ${isDarkMode ? 'bg-teal-800 text-teal-200' : 'bg-slate-100 text-slate-600'}`}>
                        <Bell size={18} />
                    </button>
                    {triggeredAlerts.length > 0 && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                </div>

                <button 
                    onClick={toggleTheme} 
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-teal-800 text-teal-200' : 'bg-slate-100 text-slate-600'}`}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </div>
    );
  }

  const renderContent = () => {
    if (activeTab === 'home') {
        return (
            <div className="p-4 space-y-6 pb-24">
                {renderHeader()}

                {/* Notifications for Alerts */}
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

                {/* Hero / CTA */}
                <div className={`rounded-2xl p-6 shadow-xl relative overflow-hidden ${isDarkMode ? 'bg-teal-900' : 'bg-slate-900'}`}>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <h2 className="font-bold text-lg mb-2 text-white">Find Nearby Savings</h2>
                        <p className="text-slate-300 text-sm mb-4">Compare prices from stores right in {currentParish?.name}.</p>
                        <button 
                            onClick={() => { setActiveTab('search'); setSearchTerm(''); }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                            Start Scouting
                        </button>
                    </div>
                </div>

                {/* Chef's Corner - Meal Bundles */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                         <h3 className={`font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            Chef's Corner <span className="ml-2 text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">One-Click Meals</span>
                         </h3>
                    </div>
                    <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-2">
                        {MEAL_BUNDLES.map(bundle => (
                            <div key={bundle.id} className={`min-w-[260px] rounded-2xl p-3 border shadow-sm flex flex-col relative ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100'}`}>
                                <div className="h-32 rounded-xl overflow-hidden mb-3 relative">
                                    <img src={bundle.image} alt={bundle.title} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold">
                                        {bundle.productIds.length} items
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bundle.title}</h4>
                                    <p className={`text-xs mb-3 line-clamp-2 ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}>{bundle.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                        {bundle.savingsLabel}
                                    </span>
                                    <button 
                                        onClick={() => handleAddBundle(bundle.productIds)}
                                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                    >
                                        <ShoppingBag size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Categories</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { name: 'Pantry', emoji: '🥫' },
                            { name: 'Meat', emoji: '🥩' },
                            { name: 'Produce', emoji: '🥬' },
                            { name: 'Drinks', emoji: '🥤' }
                        ].map(cat => (
                            <button 
                                key={cat.name}
                                onClick={() => { setActiveTab('search'); setSearchTerm(cat.name); }}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border shadow-sm transition-colors ${isDarkMode ? 'bg-teal-900 border-teal-800 hover:border-emerald-500' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
                            >
                                <span className="text-2xl mb-1">{cat.emoji}</span>
                                <span className={`text-[10px] font-medium ${isDarkMode ? 'text-teal-200' : 'text-slate-600'}`}>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Trending */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Best Deals Nearby</h3>
                        <button onClick={() => setActiveTab('search')} className="text-emerald-500 text-xs font-semibold flex items-center">
                            See All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {PRODUCTS.slice(0, 4).map(p => (
                            <ProductCard 
                                key={p.id} 
                                product={p} 
                                onClick={() => setSelectedProduct(p)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'search') {
        return (
            <div className="p-4 pb-24 min-h-screen">
                {renderHeader()}
                <div className={`sticky top-0 z-20 pb-4 pt-2 ${isDarkMode ? 'bg-teal-950' : 'bg-[#f8fafc]'}`}>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Search products..."
                          className={`w-full border rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm ${isDarkMode ? 'bg-teal-900 border-teal-800 text-white placeholder-teal-600' : 'bg-white border-slate-200'}`}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          autoFocus
                        />
                      </div>
                      
                      <div className="flex space-x-2 overflow-x-auto hide-scrollbar mt-4">
                        {['All', 'Sunday Dinner', 'Survival', 'Pantry'].map((tag, i) => (
                            <button 
                                key={tag}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-emerald-600 text-white' : (isDarkMode ? 'bg-teal-900 border border-teal-800 text-teal-200' : 'bg-white border-slate-200 text-slate-600')}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onClick={() => setSelectedProduct(product)}
                        />
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="text-center mt-20 text-slate-400">
                        <p>No items found.</p>
                    </div>
                )}
            </div>
        );
    }
    
    if (activeTab === 'cart') {
        return (
            <div className="p-4 pb-24 min-h-screen flex flex-col">
                {renderHeader()}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center max-w-xs">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-teal-900' : 'bg-slate-100'}`}>
                            <TrendingDown className="text-emerald-500" size={32} />
                        </div>
                        <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Cart Comparison</h2>
                        <p className={`text-sm ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>Add items to your cart and we'll tell you exactly which store is cheapest for your whole list.</p>
                        <button 
                            onClick={() => setActiveTab('search')}
                            className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold w-full shadow-lg hover:bg-emerald-500"
                        >
                            Start Scouting
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (activeTab === 'profile') {
        return (
            <div className="p-4 pb-24 min-h-screen">
                {renderHeader()}
                <div className="max-w-lg mx-auto">
                    {/* Profile Header */}
                    <div className={`p-6 rounded-2xl mb-6 flex items-center space-x-4 ${isDarkMode ? 'bg-teal-900' : 'bg-white shadow-sm border border-slate-100'}`}>
                         <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-2xl">
                             S
                         </div>
                         <div>
                             <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Scout Leader</h2>
                             <div className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
                                 Level 1 Contributor
                             </div>
                         </div>
                    </div>

                    {/* Stats / Savings Hook */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-teal-900' : 'bg-slate-900 text-white'}`}>
                            <div className="flex items-center text-xs opacity-80 mb-1">
                                <Wallet size={12} className="mr-1" /> Potential Savings
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">
                                ${totalSaved.toLocaleString()}
                            </div>
                            <div className="text-[10px] opacity-60">in current cart</div>
                        </div>
                        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100'}`}>
                             <div className={`flex items-center text-xs mb-1 ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>
                                <Award size={12} className="mr-1" /> Scout Score
                            </div>
                            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                125
                            </div>
                            <div className={`text-[10px] ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`}>Top 10% in Parish</div>
                        </div>
                    </div>
                    
                    {/* Saved Items Section */}
                    {savedProducts.length > 0 && (
                        <div className="mb-6">
                            <h3 className={`font-bold text-lg mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                <Heart size={18} className="mr-2 text-rose-500" fill="currentColor" /> Saved for Later
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {savedProducts.map(p => (
                                    <div key={p.id} className={`p-3 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100'}`}>
                                        <div className="flex items-center space-x-3 overflow-hidden">
                                            <div className="w-10 h-10 bg-white rounded-lg p-1 flex-shrink-0">
                                                <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="truncate">
                                                <div className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{p.name}</div>
                                                <div className={`text-[10px] ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>{p.unit}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeSavedItem(p.id)}
                                            className="text-slate-400 hover:text-rose-500 transition-colors p-2"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Catalogue Builder */}
                    <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-teal-900' : 'bg-white shadow-sm border border-slate-100'}`}>
                        <div className="mb-6">
                            <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Build the Catalogue</h3>
                            <p className={`text-sm ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>
                                Help us grow! Upload details of new items you find in {currentParish?.name}.
                            </p>
                        </div>

                        {!itemSubmitted ? (
                            <div className="space-y-4">
                                <div>
                                    <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`}>Product Name</label>
                                    <input 
                                        type="text"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        placeholder="e.g. Red Stripe 6-Pack"
                                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-teal-800 border-teal-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                                    />
                                </div>
                                
                                <div>
                                    <label className={`block text-xs font-bold uppercase mb-2 ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`}>Observed Price</label>
                                    <input 
                                        type="number"
                                        value={itemPrice}
                                        onChange={(e) => setItemPrice(e.target.value)}
                                        placeholder="0.00"
                                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-teal-800 border-teal-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                                    />
                                </div>

                                <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDarkMode ? 'border-teal-700 hover:border-emerald-500' : 'border-slate-200 hover:border-emerald-400'}`}>
                                    <Camera size={32} className={`mb-2 ${isDarkMode ? 'text-teal-500' : 'text-slate-400'}`} />
                                    <span className={`text-sm font-medium ${isDarkMode ? 'text-teal-200' : 'text-slate-600'}`}>Take a Photo</span>
                                    <span className="text-[10px] text-slate-400 mt-1">or select from gallery</span>
                                </div>

                                <button 
                                    onClick={() => {
                                        if (itemName) setItemSubmitted(true);
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center"
                                >
                                    <Upload size={18} className="mr-2" /> Submit to Catalogue
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 animate-fade-in-up">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="text-emerald-600" size={32} />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Submitted!</h3>
                                <p className={`text-sm mb-6 ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>
                                    Thanks for adding <strong>{itemName}</strong>. Our team will verify the price and update the app.
                                </p>
                                <button 
                                    onClick={() => {
                                        setItemSubmitted(false);
                                        setItemName('');
                                        setItemPrice('');
                                    }}
                                    className="text-emerald-500 font-semibold text-sm underline"
                                >
                                    Add another item
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return <div className="p-10 text-center">Work in progress</div>;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-teal-950' : 'bg-[#f8fafc]'}`}>
      {renderContent()}
      <CartDrawer />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <ChatBot />
      
      {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
      )}
    </div>
  );
};