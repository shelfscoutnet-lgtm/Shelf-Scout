import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Parish, Store, Product, CartItem, PriceAlert } from '../types';
import { useParishLocator } from '../hooks/useParishLocator';
import { useStores } from '../hooks/useStores';
 
interface ShopContextType {
  currentParish: Parish | null;
  setCurrentParish: (parish: Parish) => void;
  resetParish: () => void;
  isLoading: boolean;
  isLoadingLocation: boolean;
  
  stores: Store[];
  locations: string[];
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  
  cart: CartItem[];
  cartItemCount: number;
  primaryStore: Store | null;
  getCartTotal: (storeId?: string) => number;
  addToCart: (product: Product, storeId?: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  
  priceAlerts: PriceAlert[];
  addPriceAlert: (alert: PriceAlert) => void;
  removePriceAlert: (alertId: string) => void;
  
  userCoords: { lat: number; lng: number } | null;
  manualOverride: (parishId: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { detectedParish, loading: locLoading, manualOverride, userCoords } = useParishLocator();
  const [currentParish, setCurrentParish] = useState<Parish | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [primaryStore, setPrimaryStore] = useState<Store | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);

  // Fetch stores based on current parish
  const { stores = [], loading: storesLoading } = useStores(currentParish?.id) || {};

  // Sync detected parish to local state
  useEffect(() => {
    if (detectedParish) setCurrentParish(detectedParish);
  }, [detectedParish]);

  // Extract unique cities from stores
  const locations = useMemo(() => {
    if (!stores.length) return [];
    const citySet = new Set<string>();
    stores.forEach(s => {
      if (s.city && s.city !== 'Unknown') citySet.add(s.city);
    });
    return Array.from(citySet).sort();
  }, [stores]);

  // Calculate cart item count
  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cart]);

  // Safe cart total calculation
  const getCartTotal = (storeId?: string) => {
    return cart.reduce((total, item) => {
      try {
        const priceEntry = (item.prices as any)?.[storeId || ''];
        const val = typeof priceEntry === 'object' && priceEntry?.val 
          ? Number(priceEntry.val) 
          : typeof priceEntry === 'number' 
          ? priceEntry 
          : 0;
        return total + (val * (item.quantity || 1));
      } catch (error) {
        console.warn('Price calculation error:', error);
        return total;
      }
    }, 0);
  };

  // Add item to cart with validation
  const addToCart = (product: Product, storeId?: string) => {
    if (!product || !product.id) return;
    
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: (p.quantity || 1) + 1 } 
            : p
        );
      }
      return [...prev, { ...product, quantity: 1, selectedStoreId: storeId }];
    });
  };

  // Update cart item quantity
  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(p => p.id === productId ? { ...p, quantity } : p)
    );
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  // Add price alert
  const addPriceAlert = (alert: PriceAlert) => {
    if (!alert || !alert.productId) return;
    setPriceAlerts(prev => {
      // Remove duplicate alerts for same product
      const filtered = prev.filter(a => a.productId !== alert.productId);
      return [...filtered, alert];
    });
  };

  // Remove price alert
  const removePriceAlert = (alertId: string) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const value: ShopContextType = {
    currentParish,
    setCurrentParish,
    resetParish: () => { 
      setCurrentParish(null); 
      setSelectedLocation('All');
      setCart([]);
      setPriceAlerts([]);
    },
    isLoading: locLoading || storesLoading,
    isLoadingLocation: locLoading,
    manualOverride,
    stores,
    locations,
    selectedLocation,
    setSelectedLocation,
    cart,
    cartItemCount,
    primaryStore,
    getCartTotal,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    priceAlerts,
    addPriceAlert,
    removePriceAlert,
    userCoords,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};
