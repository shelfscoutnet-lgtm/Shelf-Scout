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

  // --- DATA INTEGRITY LOGIC ---
  
  // 1. Identify valid stores strictly within the Current Parish (matching cleansed IDs)
  const localStores = useMemo(() => {
    if (!currentParish) return [];
    return stores.filter(store => store.parish === currentParish.id);
  }, [stores, currentParish]);

  // 2. Extract context-specific pricing for this product
  const { localPrice, localStoreCount, hasLocalPrice, gctTag } = useMemo(() => {
    // Filter the universal product prices against the local store list
    const pricesInParish = localStores
      .map(store => ({
        price: product.prices[store.id],
        // Meticulous Check: Pull the new GCT tag from the product data
        gct: (product as any).gct_tags?.[store.id] || "" 
      }))
      .filter(item => typeof item.price === 'number');

    const count = pricesInParish.length;
    // Find the cheapest entry in this parish
    const cheapest = count > 0 
      ? pricesInParish.reduce((min, p) => p.price < min.price ? p : min, pricesInParish[0])
      : null;

    return {
      localPrice: cheapest ? cheapest.price : 0,
      gctTag: cheapest ? cheapest.gct : "",
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
      {/* 1. IMAGE AREA */}
      <div className="h-40 w-full relative p-4 flex items-center justify-center bg-white border-b border-slate-100/10">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Local Availability Badge */}
        {hasLocalPrice ? (
          localStoreCount > 1 && (
            <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
              <StoreIcon size={10} className="mr-1 text-emerald-400" />
              {localStoreCount} Stores Locally
            </div>
          )
        ) : (
          <div className="absolute top-2 left-2 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
            <AlertCircle size={10} className="mr-1" />
            Scout Needed
          </div>
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 shadow-sm">
             <Heart size={14} />
           </button>
        </div>
      </div>

      {/* 2. DETAILS AREA */}
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
          {product.unit || 'Standard Unit'}
        </div>

        {/* PRICE BAR */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex flex-col">
            <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {hasLocalPrice ? 'Best Local Price' : 'Price Status'}
            </span>
            
            <div className="flex items-baseline gap-1">
              <span className={`font-extrabold text-lg leading-none ${
                hasLocalPrice ? 'text-emerald-500' : (isDarkMode ? 'text-slate-600' : 'text-slate-300')
              }`}>
                {hasLocalPrice ? `$${localPrice.toLocaleString()}` : 'No Data'}
              </span>
              {/* METICULOUS GCT TAG DISPLAY */}
              {hasLocalPrice && gctTag && (
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {gctTag}
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-lg ${
              isDarkMode 
                ? 'bg-slate-800 text-white hover:bg-emerald-600' 
                : 'bg-slate-900 text-white hover:bg-emerald-600'
            }`}
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};
