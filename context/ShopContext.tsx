import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Region, Product, CartItem, Store } from '../types';
import { useRegionLocator } from '../hooks/useRegionLocator';
import { useStores } from '../hooks/useStores';

interface ShopContextType {
  currentRegion: Region | null;
  setCurrentRegion: (region: Region) => void;
  resetRegion: () => void;
  isLoading: boolean; // Unified loading state
  isLoadingLocation: boolean;
  manualOverride: (regionId: string) => void;
  
  stores: Store[]; 
  locations: string[]; 
  selectedLocation: string; 
  setSelectedLocation: (loc: string) => void;
  
  cart: CartItem[];
  cartItemCount: number;
  getCartTotal: (storeId?: string) => number;
  addToCart: (product: Product, storeId?: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { detectedRegion, loading: locLoading, manualOverride } = useRegionLocator();
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. Meticulous Store Fetching: Use standardized Region ID (e.g., 'jm-03')
  const { stores = [], loading: storesLoading } = useStores(currentRegion?.id) || {};

  // 2. Lifecycle: Sync detected region to local state
  useEffect(() => {
    if (detectedRegion) setCurrentRegion(detectedRegion);
  }, [detectedRegion]);

  // 3. Meticulous City Extraction: Derived from verified store data
  const locations = useMemo(() => {
    if (!stores.length) return [];
    const citySet = new Set<string>();
    stores.forEach(s => {
      if (s.city && s.city !== 'Unknown') citySet.add(s.city);
    });
    return Array.from(citySet).sort();
  }, [stores]);

  // 4. Meticulous Calculations: Ensure sub-totals are calculated correctly
  const getCartTotal = (storeId?: string) => {
    return cart.reduce((total, item) => {
      const priceEntry = (item.prices as any)?.[storeId || ''];
      const val = typeof priceEntry === 'object' ? priceEntry.val : priceEntry;
      return total + ((val || 0) * item.quantity);
    }, 0);
  };

  const addToCart = (product: Product, storeId?: string) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1, selectedStoreId: storeId }];
    });
  };

  const value = {
    currentRegion,
    setCurrentRegion,
    resetRegion: () => { setCurrentRegion(null); setSelectedLocation('All'); },
    isLoading: locLoading || storesLoading,
    isLoadingLocation: locLoading || storesLoading,
    manualOverride,
    stores,
    locations,
    selectedLocation,
    setSelectedLocation,
    cart,
    cartItemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    getCartTotal,
    addToCart
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};
