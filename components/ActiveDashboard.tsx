import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight, TrendingDown, Users, Moon, Sun, MapPin, ArrowLeft, Camera, Upload, Check, ShoppingBag, Wallet, Award, Heart, Trash2, Bell, Loader2, Database, AlertCircle, Store as StoreIcon, Save, Zap, XCircle, LogOut, Mail, Lock, X, Minus, Plus, Utensils, Clock } from 'lucide-react';
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
