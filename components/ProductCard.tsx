import React, { useMemo } from 'react';
import { Plus, Share2, Heart, Store as StoreIcon } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const { addToCart, primaryStore, stores } = useShop();
  const { isDarkMode } = useTheme();

  // Determine the display price
  const displayPrice = useMemo(() => {
    if (primaryStore && product.prices[primaryStore.id]) {
      return product.prices[primaryStore.id];
    }
    const prices = Object.values(product.prices).filter((p): p is number => typeof p === 'number');
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [product, primaryStore]);

  const storeCount = Object.keys(product.prices).length;

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
      {/* 1. IMAGE CONTAINER - Fixed Height (h-40) instead of Aspect Square */}
      {/* We keep bg-white to ensure non-transparent JPEGs don't look like ugly stickers on a dark background */}
      <div className="h-40 w-full relative p-4 flex items-center justify-center bg-white border-b border-slate-100/10">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Store Badge */}
        {storeCount > 1 && (
          <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
            <StoreIcon size={10} className="mr-1 text-emerald-400" />
            {storeCount} Stores
          </div>
        )}

        {/* Heart Icon */}
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
              From
            </span>
            <span className="font-extrabold text-lg text-emerald-500 leading-none">
              ${displayPrice.toLocaleString()}
            </span>
          </div>

          <button 
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-emerald-500/20 ${
              isDarkMode 
                ? 'bg-emerald-500 text-white hover:bg-emerald-400' 
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
