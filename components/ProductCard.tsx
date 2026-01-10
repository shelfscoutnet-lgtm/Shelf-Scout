import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { Plus, MapPin, Share2, Heart, Store as StoreIcon } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { IS_BETA_MODE } from '../config';

interface Props {
  product: Product;
  onClick?: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const { addToCart, stores, selectedLocation, currentParish } = useShop();
  const { isDarkMode } = useTheme();
  const [isSaved, setIsSaved] = useState(false);

  // Initialize Save State from LocalStorage
  useEffect(() => {
    try {
        const saved = localStorage.getItem('shelf_scout_saved');
        if (saved) {
            const parsed = JSON.parse(saved);
            setIsSaved(Array.isArray(parsed) && parsed.includes(product.id));
        }
    } catch (e) {
        console.error("Error reading from localStorage", e);
    }
  }, [product.id]);

  // Filter stores based on selected region
  const filteredStores = useMemo(() => {
      if (selectedLocation === 'All' || selectedLocation.startsWith('All')) {
          return stores;
      }
      return stores.filter(s => s.location === selectedLocation);
  }, [stores, selectedLocation]);

  const storeOptions = filteredStores
    .map(store => ({
      id: store.id,
      name: store.name,
      price: product.prices[store.id],
      chain: store.chain,
      location: store.location
    }))
    .filter(option => option.price !== undefined)
    .sort((a, b) => a.price - b.price); // Sort cheapest first

  const isAvailable = storeOptions.length > 0;
  const lowestPrice = isAvailable ? storeOptions[0].price : 0;
  const storeCount = storeOptions.length;

  // Badge Logic
  const isSimulated = IS_BETA_MODE && currentParish?.id === 'jm-ksa';

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}?product=${product.id}`;
    const text = isAvailable 
        ? `Found ${product.name} from $${lowestPrice.toLocaleString()} in ${selectedLocation}. Check it out on Shelf Scout!`
        : `Check out ${product.name} on Shelf Scout!`;
        
    const shareData = {
        title: 'Shelf Scout Price Alert',
        text: text,
        url: url
    };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share cancelled');
        }
    } else {
        try {
            await navigator.clipboard.writeText(`${text} ${url}`);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        const saved = localStorage.getItem('shelf_scout_saved');
        let parsed: string[] = saved ? JSON.parse(saved) : [];
        
        if (isSaved) {
            parsed = parsed.filter(id => id !== product.id);
        } else {
            if (!parsed.includes(product.id)) {
                parsed.push(product.id);
            }
        }
        
        localStorage.setItem('shelf_scout_saved', JSON.stringify(parsed));
        setIsSaved(!isSaved);
    } catch (e) {
        console.error("Error updating localStorage", e);
    }
  };

  if (!isAvailable) {
      return null; 
  }

  return (
    <div 
        onClick={onClick}
        className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl cursor-pointer
        ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
    >
      
      {/* --- IMAGE AREA (Strict Grid Update) --- */}
      {/* "aspect-square" forces this to be a perfect box. "p-6" gives the product room to breathe. */}
      <div className={`relative w-full aspect-square flex items-center justify-center p-6 
        ${isDarkMode ? 'bg-teal-800/50' : 'bg-slate-50'}`}>
        
        <img 
            src={product.image_url} 
            alt={product.name} 
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-multiply" 
        />
        
        {/* Top Right Actions (Save/Share) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
                onClick={toggleSave}
                className={`p-2 rounded-full shadow-sm transition-colors ${
                    isSaved 
                    ? 'bg-rose-50 text-rose-500' 
                    : 'bg-white text-slate-400 hover:text-rose-500'
                }`}
            >
                <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>

            <button 
                onClick={handleShare}
                className="p-2 rounded-full bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
            >
                <Share2 size={16} />
            </button>
        </div>

        {/* Top Left Store Badge */}
        <div className="absolute top-3 left-3 z-10">
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border
                ${product.store_count > 1 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : 'bg-white/90 text-slate-600 border-slate-200'}`}>
                <StoreIcon size={10} />
                {product.store_count > 1 ? `${storeCount} Stores` : '1 Store'}
            </div>
        </div>
      </div>
      
      {/* --- CONTENT AREA --- */}
      <div className="flex h-full flex-col p-4">
        {/* Category */}
        <div className={`text-[10px] uppercase font-bold tracking-wider mb-1.5 
            ${isDarkMode ? 'text-teal-300' : 'text-slate-400'}`}>
            {product.category}
        </div>

        {/* Title (Forced Height Update) */}
        {/* h-10 line-clamp-2 forces the title to always be 2 lines tall, ensuring alignment */}
        <h3 className={`font-semibold text-sm leading-snug line-clamp-2 h-10 mb-1 
            ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {product.name}
        </h3>
        
        {/* Unit Size */}
        <div className={`text-xs mb-4 ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}>
            {product.unit}
        </div>
        
        {/* Footer: Price & Add Button */}
        <div className="mt-auto flex items-end justify-between border-t pt-3 border-transparent">
            <div className="flex flex-col">
                <span className={`text-[10px] font-medium ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`}>
                    From
                </span>
                <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-slate-900'}`}>
                        ${lowestPrice.toLocaleString()}
                    </span>
                    {isSimulated && (
                        <span className="text-[9px] uppercase font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                            Beta
                        </span>
                    )}
                </div>
            </div>
            
            <button 
                onClick={(e) => {
                    e.stopPropagation(); 
                    addToCart(product, storeOptions[0].id);
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95 shadow-sm
                ${isDarkMode 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-teal-950' 
                  : 'bg-slate-900 hover:bg-emerald-600 text-white'}`}
            >
                <Plus size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};
