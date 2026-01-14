import React, { useMemo } from 'react';
import { Plus, Heart, Store as StoreIcon, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const { addToCart, stores, currentParish } = useShop();
  const { isDarkMode } = useTheme();

  // --- METICULOUS DATA LOGIC ---
  
  // 1. Identify stores specifically in the current parish
  const localStores = useMemo(() => {
    if (!currentParish) return [];
    return stores.filter(store => store.parish_id === currentParish.id);
  }, [stores, currentParish]);

  // 2. Calculate Pricing & Availability for this specific parish
  const { localPrice, localStoreCount, hasLocalPrice } = useMemo(() => {
    // Find prices only from stores in this parish
    const pricesInParish = localStores
      .map(store => product.prices[store.id])
      .filter((p): p is number => typeof p === 'number');

    const count = pricesInParish.length;
    const lowest = count > 0 ? Math.min(...pricesInParish) : 0;

    return {
      localPrice: lowest,
      localStoreCount: count,
      hasLocalPrice: count > 0
    };
  }, [localStores, product.prices]);

  // --- INTERACTION ---
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 active:scale-[0.98] flex flex-col ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 shadow-none' 
          : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
      }`}
    >
      {/* 1. IMAGE CONTAINER - Full Color, Never Grayscale */}
      <div className="h-40 w-full relative p-4 flex items-center justify-center bg-white border-b border-slate-100/10">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Availability Badge - Top Left */}
        {hasLocalPrice ? (
          localStoreCount > 1 && (
            <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
              <StoreIcon size={10} className="mr-1 text-emerald-400" />
              {localStoreCount} Stores
            </div>
          )
        ) : (
          // BANNER: "No Prices Collected Yet" - Instead of graying out
          <div className="absolute top-2 left-2 bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
            <AlertCircle size={10} className="mr-1" />
            No Price in {currentParish?.name}
          </div>
        )}

        {/* Heart Icon - Top Right */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm">
             <Heart size={14} />
           </button>
        </div>
      </div>

      {/* 2. DETAILS CONTAINER */}
      <div className="p-3 flex flex-col flex-1">
        <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 truncate ${
          isDarkMode ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {product.category}
        </div>

        <h3 className={`font-bold text-sm leading-tight mb-1 line-clamp-2 ${
          isDarkMode ? 'text-slate-100' : 'text-slate-900'
        }`}>
          {product.name}
        </h3>

        <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {product.unit}
        </div>

        {/* Price Row - Pushed to bottom */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {hasLocalPrice ? 'Best Local Price' : 'Status'}
            </span>
            
            {/* Price Display Logic */}
            {hasLocalPrice ? (
              <span className="font-extrabold text-lg text-emerald-500 leading-none">
                ${localPrice.toLocaleString()}
              </span>
            ) : (
              <span className={`text-sm font-bold leading-none ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Scout Needed
              </span>
            )}
          </div>

          <button 
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-lg ${
              isDarkMode 
                ? 'bg-slate-800 text-white hover:bg-emerald-600 shadow-slate-900/20' 
                : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-900/20'
            }`}
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};
