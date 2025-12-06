import React, { createContext, useContext, useState, useEffect } from 'react';
import { Parish, Product, CartItem, Store, PriceAlert } from '../types';
import { useParishLocator } from '../hooks/useParishLocator';
import { STORES, PARISHES } from '../constants';

interface ShopContextType {
  currentParish: Parish | null;
  isLoadingLocation: boolean;
  manualOverride: (id: string) => void;
  userCoords: { lat: number; lng: number } | null;
  primaryStore: Store | null;
  comparisonStore: Store | null;
  setPrimaryStore: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: Product, storeId?: string) => void;
  addMultipleToCart: (products: Product[]) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, delta: number) => void;
  getCartTotal: (storeId?: string) => number;
  isCartAnimating: boolean;
  priceAlerts: PriceAlert[];
  addPriceAlert: (productId: string, targetPrice: number) => void;
  removePriceAlert: (productId: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { detectedParish, loading: isLoadingLocation, manualOverride, userCoords } = useParishLocator();
  const [primaryStore, setPrimaryStoreState] = useState<Store | null>(null);
  const [comparisonStore, setComparisonStore] = useState<Store | null>(null);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  
  // Initialize Cart from LocalStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
        const savedCart = localStorage.getItem('shelf_scout_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        console.error("Failed to load cart from storage", e);
        return [];
    }
  });

  // Initialize Price Alerts from LocalStorage
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
        const savedAlerts = localStorage.getItem('shelf_scout_alerts');
        return savedAlerts ? JSON.parse(savedAlerts) : [];
    } catch (e) {
        return [];
    }
  });

  // Persist Cart
  useEffect(() => {
    try {
        localStorage.setItem('shelf_scout_cart', JSON.stringify(cart));
    } catch (e) {
        console.error("Failed to save cart to storage", e);
    }
  }, [cart]);

  // Persist Alerts
  useEffect(() => {
    try {
        localStorage.setItem('shelf_scout_alerts', JSON.stringify(priceAlerts));
    } catch (e) {
        console.error("Failed to save alerts", e);
    }
  }, [priceAlerts]);

  // Logic to calculate Stores based on Parish
  useEffect(() => {
    if (detectedParish) {
      const parishStores = STORES.filter(s => s.parish_id === detectedParish.id);
      
      let newPrimary = parishStores.find(s => s.is_premium);
      if (!newPrimary) {
        newPrimary = parishStores.length > 0 ? parishStores[0] : STORES[0]; 
      }
      setPrimaryStoreState(newPrimary);

      let newComparison: Store | undefined;
      if (detectedParish.tier === 'active') {
        newComparison = parishStores.find(s => !s.is_premium && s.id !== newPrimary?.id);
        if (!newComparison && parishStores.length > 1) {
             newComparison = parishStores.find(s => s.id !== newPrimary?.id);
        }
      } else {
        const activeParish = PARISHES.find(p => p.tier === 'active');
        if (activeParish) {
           const activeStores = STORES.filter(s => s.parish_id === activeParish.id);
           newComparison = activeStores.find(s => !s.is_premium) || activeStores[0];
        }
      }

      if (!newComparison || newComparison.id === newPrimary?.id) {
         newComparison = STORES.find(s => s.id !== newPrimary?.id);
      }
      setComparisonStore(newComparison || null);
    }
  }, [detectedParish]);

  const setPrimaryStore = (storeId: string) => {
    const s = STORES.find(st => st.id === storeId);
    if (s) setPrimaryStoreState(s);
  };

  const triggerCartAnimation = () => {
    setIsCartAnimating(true);
    setTimeout(() => setIsCartAnimating(false), 500); // 500ms bounce duration
  };

  const addToCart = (product: Product, storeId?: string) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { 
            ...p, 
            quantity: p.quantity + 1,
            selectedStoreId: storeId || p.selectedStoreId 
        } : p);
      }
      return [...prev, { ...product, quantity: 1, selectedStoreId: storeId }];
    });
    triggerCartAnimation();
  };

  const updateCartItemQuantity = (productId: string, delta: number) => {
    setCart(prev => {
        return prev.map(item => {
            if (item.id === productId) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0);
    });
  };

  const addMultipleToCart = (products: Product[]) => {
    setCart(prev => {
      let newCart = [...prev];
      products.forEach(product => {
        const existingIndex = newCart.findIndex(p => p.id === product.id);
        if (existingIndex >= 0) {
          newCart[existingIndex] = { ...newCart[existingIndex], quantity: newCart[existingIndex].quantity + 1 };
        } else {
          newCart.push({ ...product, quantity: 1 });
        }
      });
      return newCart;
    });
    triggerCartAnimation();
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const getCartTotal = (storeId?: string) => {
    return cart.reduce((total, item) => {
      const targetStoreId = storeId || item.selectedStoreId || primaryStore?.id;
      if (!targetStoreId) return total;
      const price = item.prices[targetStoreId] || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const addPriceAlert = (productId: string, targetPrice: number) => {
      setPriceAlerts(prev => {
          // Remove existing alert for this product if any
          const filtered = prev.filter(a => a.productId !== productId);
          return [...filtered, { productId, targetPrice }];
      });
  };

  const removePriceAlert = (productId: string) => {
      setPriceAlerts(prev => prev.filter(a => a.productId !== productId));
  };

  return (
    <ShopContext.Provider value={{
      currentParish: detectedParish,
      isLoadingLocation,
      manualOverride,
      userCoords,
      primaryStore,
      comparisonStore,
      setPrimaryStore,
      cart,
      addToCart,
      addMultipleToCart,
      removeFromCart,
      updateCartItemQuantity,
      getCartTotal,
      isCartAnimating,
      priceAlerts,
      addPriceAlert,
      removePriceAlert
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};