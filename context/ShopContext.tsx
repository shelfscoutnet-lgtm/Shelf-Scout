import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { Parish, Product, CartItem, Store, PriceAlert } from '../types';
import { useParishLocator } from '../hooks/useParishLocator';
import { useStores } from '../hooks/useStores';
import { PARISHES } from '../data/parishes';

interface ShopContextType {
  currentParish: Parish | null;
  setCurrentParish: (parish: Parish) => void;
  resetParish: () => void;
  isLoadingLocation: boolean;
  manualOverride: (id: string) => void;
  userCoords: { lat: number; lng: number } | null;
  
  stores: Store[]; 
  locations: string[]; // Unique list of locations specific to current parish
  selectedLocation: string; 
  setSelectedLocation: (loc: string) => void;

  primaryStore: Store | null;
  setPrimaryStore: (id: string) => void;
  comparisonStore: Store | null;
  
  cart: CartItem[];
  cartItemCount: number; // Total number of items (sum of quantities)
  addToCart: (product: Product, storeId?: string) => void;
  addMultipleToCart: (items: {product: Product, storeId?: string}[]) => void;
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
  
// State for the currently selected Parish (Default: St. Catherine)
  const [currentParish, setCurrentParish] = useState<Parish | null>(
    PARISHES.find(p => p.id === 'st-catherine') || null
  );

  // Fetch stores ONLY for the current parish Name (Strict Filtering for Kingston Only strategy)
  const { stores, loading: isLoadingStores } = useStores(currentParish?.name);

  // Sync detected parish to state only if manually overridden via locator
  useEffect(() => {
    if (detectedParish) {
        setCurrentParish(detectedParish);
    }
  }, [detectedParish]);

  const resetParish = () => {
      setCurrentParish(null);
      setSelectedLocation('All');
  };

  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [primaryStore, setPrimaryStoreState] = useState<Store | null>(null);
  const [comparisonStore, setComparisonStore] = useState<Store | null>(null);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  
  // Extract unique locations from the ALREADY FILTERED stores
  const locations = useMemo(() => {
    if (!currentParish || !stores) return [];
    
    // Stores are already filtered by parish NAME in useStores hook
    // We just need to extract locations and Normalize (Title Case)
    const locs = new Set<string>();
    stores.forEach(s => {
        if (s.location && s.location.trim() !== '') {
            const normalized = s.location.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            locs.add(normalized);
        }
    });
    
    return Array.from(locs).sort();
  }, [stores, currentParish]);

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

  // Calculate total item count (sum of quantities)
  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

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

  // Auto-set Primary Store logic
  useEffect(() => {
    if (!primaryStore && stores.length > 0) {
       setPrimaryStoreState(stores[0]);
    }
  }, [stores, primaryStore]);

  const setPrimaryStore = (storeId: string) => {
    const s = stores.find(st => st.id === storeId);
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
        // Smart Add: Increase quantity if exists
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
        }).filter(item => item.quantity > 0); // Logic: Remove if quantity is 0
    });
  };

  const addMultipleToCart = (items: {product: Product, storeId?: string}[]) => {
    setCart(prev => {
      let newCart = [...prev];
      items.forEach(({product, storeId}) => {
        const existingIndex = newCart.findIndex(p => p.id === product.id);
        if (existingIndex >= 0) {
          newCart[existingIndex] = { 
            ...newCart[existingIndex], 
            quantity: newCart[existingIndex].quantity + 1,
            selectedStoreId: storeId || newCart[existingIndex].selectedStoreId
          };
        } else {
          newCart.push({ ...product, quantity: 1, selectedStoreId: storeId });
        }
      });
      return newCart;
    });
    triggerCartAnimation();
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  // Logic: Sum(Item Price * Quantity)
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
          const filtered = prev.filter(a => a.productId !== productId);
          return [...filtered, { productId, targetPrice }];
      });
  };

  const removePriceAlert = (productId: string) => {
      setPriceAlerts(prev => prev.filter(a => a.productId !== productId));
  };

  // Wrapper for manual override
  const handleManualOverride = (id: string) => {
      manualOverride(id);
  };

  return (
    <ShopContext.Provider value={{
      currentParish,
      setCurrentParish,
      resetParish,
      isLoadingLocation,
      manualOverride: handleManualOverride,
      userCoords,
      stores,
      locations,
      selectedLocation,
      setSelectedLocation,
      primaryStore,
      comparisonStore,
      setPrimaryStore,
      cart,
      cartItemCount,
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
