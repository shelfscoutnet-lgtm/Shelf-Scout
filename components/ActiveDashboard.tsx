import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, ChevronRight, TrendingDown, Users, Moon, Sun, MapPin, ArrowLeft, 
  Camera, Upload, Check, ShoppingBag, Wallet, Award, Heart, Trash2, Bell, 
  Loader2, Database, AlertCircle, Store as StoreIcon, Save, Zap, XCircle, 
  LogOut, Mail, Lock, X, Minus, Plus, Utensils, Clock 
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
  
  // Data & State
  const signupsData = useSignups(currentParish?.id);
  const signupCount = signupsData ? (signupsData.signupCount || 0) : 0;
  const submitSignup = signupsData ? signupsData.submitSignup : undefined;

  const [activeTab, setActiveTab] = useState('home');
  const [showImportPage, setShowImportPage] = useState(false);
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // Auth State
  const [userEmail, setUserEmail] = useState<string | null>(() => {
      try { return localStorage.getItem('shelf_scout_user_email'); } catch { return null; }
  });
  const [loginInput, setLoginInput] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  
  // Modal State
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

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

  // Product Logic
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [savedProductIds, setSavedProductIds] = useState<string[]>([]);

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
                  onClick
