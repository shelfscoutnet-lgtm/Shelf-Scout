import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Parish, Product, CartItem, Store, PriceAlert } from '../types';
import { useParishLocator } from '../hooks/useParishLocator';
import { useStores } from '../hooks/useStores';

interface ShopContextType {
  currentParish: Parish | null;
  setCurrentParish: (parish: Parish) => void;
  resetParish: () => void;
  isLoadingLocation: boolean;
  manualOverride: (id: string) => void;
  
  stores: Store[]; 
  locations: string[]; // Dynamically fetched cities (e.g., "Portmore")
  selectedLocation: string; 
  setSelectedLocation: (loc: string) => void;
  
  cart: CartItem[];
  cartItemCount: number;
  addToCart: (product: Product, storeId?: string) => void;
  getCartTotal: (storeId?: string) => number;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { detectedParish, loading: isLoadingLocation, manualOverride } = useParishLocator();
  const [currentParish, setCurrentParish] = useState<Parish | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // METICULOUS FIX: Fetch stores using currentParish.id (st-catherine) 
  // to match the standardized database IDs.
  const { stores } = useStores(currentParish?.id);

  useEffect(() => {
    if (detectedParish) setCurrentParish(detectedParish);
  }, [detectedParish]);

  // DYNAMIC CITY SELECTOR: Extract unique cities from the stores in this parish
  const locations = useMemo(() => {
    if (!stores.length) return [];
    // Filter out "Unknown" and get unique cities like "Portmore"
    const citySet = new Set<string>();
    stores.forEach(s => {
      if (s.city && s.city !== 'Unknown') {
        citySet.add(s.city);
      }
    });
    return Array.from(citySet).sort();
  }, [stores]);

  const [cart, setCart] = useState<CartItem[]>([]);

  // UPDATED CART CALCULATION: Handles the new Price Package structure
  const getCartTotal = (storeId?: string) => {
    return cart.reduce((total, item) => {
      // Logic: Find the price in the specific store branch
      const priceData = (item.prices as any)[storeId || ''];
      const priceValue = typeof priceData === 'object' ? priceData.val : priceData;
      return total + ((priceValue || 0) * item.quantity);
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

  const resetParish = () => {
    setCurrentParish(null);
    setSelectedLocation('All');
  };

  return (
    <ShopContext.Provider value={{
      currentParish, setCurrentParish, resetParish, isLoadingLocation,
      manualOverride, stores, locations, selectedLocation, setSelectedLocation,
      cart, cartItemCount: cart.length, addToCart, getCartTotal
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
