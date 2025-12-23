import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Parish, Product, CartItem, Store, PriceAlert } from '../types';
import { useParishLocator } from '../hooks/useParishLocator';
import { useStores } from '../hooks/useStores';

// 🛑 DELETE THE BROKEN IMPORT
// import { PARISHES } from '../constants'; 

// ✅ FIX: Define St. Catherine right here. 
// Now the app DOES NOT need to find an external file to start.
const ST_CATHERINE_PARISH: Parish = {
  id: 'jm-03',
  name: 'St. Catherine',
  slug: 'st-catherine',
  coords: { lat: 18.0059, lng: -77.0040 },
  tier: 'active',
  waitlistCount: 0,
  launchReadiness: 100,
  communities: ['Portmore', 'Spanish Town', 'Old Harbour', 'Linstead']
};

interface ShopContextType {
  currentParish: Parish;
  setCurrentParish: (parish: Parish) => void;
  resetParish: () => void;
  isLoadingLocation: boolean;
  manualOverride: (id: string) => void;
  userCoords: { lat: number; lng: number } | null;
  
  stores: Store[]; 
  locations: string[]; 
  selectedLocation: string; 
  setSelectedLocation: (loc: string) => void;

  primaryStore: Store | null;
  setPrimaryStore: (id: string) => void;
  comparisonStore: Store | null;
  
  cart: CartItem[];
  cartItemCount: number; 
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
  
  // ✅ NO NULLS, NO CRASHES.
  // We start directly with the hardcoded St. Catherine data.
  const [currentParish, setCurrentParish] = useState<Parish>(ST_CATHERINE_PARISH);

  // Fetch stores for the current parish Name
  const { stores, loading: isLoadingStores } = useStores(currentParish.name);

  // Sync detected parish to state only if manually overridden via locator
  useEffect(() => {
    if (detectedParish) {
        setCurrentParish(detectedParish);
    }
  }, [detectedParish]);

  const resetParish = () => {
      setCurrentParish(ST_CATHERINE_PARISH);
      setSelectedLocation('All');
  };

  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [primaryStore, setPrimaryStoreState] = useState<Store | null>(null);
  const [comparisonStore, setComparisonStore] = useState<Store | null>(null);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  
  const locations = useMemo(() => {
    if (!stores) return [];
    
    const locs = new Set<string>();
    stores.forEach(s => {
        if (s.location && s.location.trim() !== '') {
            const normalized = s.location.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            locs.add(normalized);
        }
    });
    
    return Array.from(locs).sort();
  }, [stores]);

  // Cart Logic
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
        const savedCart = localStorage.getItem('shelf_scout_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        return [];
    }
  });

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
        const savedAlerts = localStorage.getItem('shelf_scout_alerts');
        return savedAlerts ? JSON.parse(savedAlerts) : [];
    } catch (e) {
        return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('shelf_scout_cart', JSON.stringify(cart));
    } catch (e) {
        console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
        localStorage.setItem('shelf_scout_alerts', JSON.stringify(priceAlerts));
    } catch (e) {
        console.error(e);
    }
  }, [priceAlerts]);

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
    setTimeout(() => setIsCartAnimating(false), 500); 
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
