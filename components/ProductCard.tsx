import React, { useMemo } from 'react';
import { Plus, Heart, Store as StoreIcon, AlertCircle, MapPin } from 'lucide-react';
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

  // --- PRECISION DATA LOGIC ---
  
  const { localPrice, hasLocalPrice, gctTag, branchName } = useMemo(() => {
    // 1. Get all available package data for this parish
    const localData = Object.values(product.prices || {}) as any[];
    
    if (localData.length === 0) {
      return { localPrice: 0, hasLocalPrice: false, gctTag: "", branchName: "" };
    }

    // 2. Find the cheapest branch in the selected area
    const cheapest = localData.reduce((min, curr) => 
      curr.val < min.val ? curr : min
    , localData[0]);

    return {
      localPrice: cheapest.val,
      gctTag: cheapest.gct || "",
      branchName: cheapest.branch || "", // e.g., "Mega Mart - Portmore"
      hasLocalPrice: true
    };
  }, [product.prices]);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 active:scale-[0.98] flex flex-col ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
      }`}
    >
      {/* 1. IMAGE AREA + BRANCH BADGE */}
      <div className="h-40 w-full relative p-4 flex items-center justify-center bg-white border-b border-slate-100/10">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* METICULOUS BRANCH BADGE: Helps people identify the exact store location */}
        {hasLocalPrice && branchName && (
          <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center shadow-lg border border-white/10">
            <MapPin size={8} className="mr-1 text-emerald-400" />
            {branchName}
          </div>
        )}

        {!hasLocalPrice && (
          <div className="absolute top-2 left-2 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
            <AlertCircle size={10} className="mr-1" />
            Scout Needed
          </div>
        )}
      </div>

      {/* 2. DETAILS AREA */}
      <div className="p-3 flex flex-col flex-1">
        <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {product.category}
        </div>

        <h3 className={`font-bold text-sm leading-tight mb-1 line-clamp-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
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
              <span className={`font-extrabold text-lg leading-none ${hasLocalPrice ? 'text-emerald-500' : (isDarkMode ? 'text-slate-600' : 'text-slate-300')}`}>
                {hasLocalPrice ? `$${localPrice.toLocaleString()}` : 'No Data'}
              </span>
              {hasLocalPrice && gctTag && (
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {gctTag}
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};
