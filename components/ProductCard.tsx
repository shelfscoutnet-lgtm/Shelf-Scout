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

  // Initialize Save State
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

  // Filter stores
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
    .sort((a, b) => a.price - b.price);

  const isAvailable = storeOptions.length > 0;
  const lowestPrice = isAvailable ? storeOptions[0].price : 0;
  const storeCount = storeOptions.length;
  const isSimulated = IS_BETA_MODE && currentParish?.id === 'jm-ksa';

  // Handlers
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}?product=${product.id}`;
    const text = isAvailable 
        ? `Found ${product.name} from $${lowestPrice.toLocaleString()} in ${selectedLocation}`
        : `Check out ${product.name} on Shelf Scout!`;
    const shareData = { title: 'Shelf Scout', text: text, url: url };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try { await navigator.share(shareData); } catch (err) {}
    } else {
        try { await navigator.clipboard.writeText(`${text} ${url}`); alert('Link copied!'); } catch (err) {}
    }
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        const saved = localStorage.getItem('shelf_scout_saved');
        let parsed: string[] = saved ? JSON.parse(saved) : [];
        if (isSaved) parsed = parsed.filter(id => id !== product.id);
        else if (!parsed.includes(product.id)) parsed.push(product.id);
        localStorage.setItem('shelf_scout_saved', JSON.stringify(parsed));
        setIsSaved(!isSaved);
    } catch (e) {}
  };

  if (!isAvailable) return null;

  return (
    <div 
        onClick={onClick}
        // KEY CHANGE 1: Kept your original minimal border and shadow. 
        // Added 'flex flex-col' to ensure the footer can be pushed to the bottom.
        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg cursor-pointer
        ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100 hover:border-emerald-200'}`}
    >
      
      {/* --- IMAGE AREA --- */}
      {/* KEY CHANGE 2: 'aspect-[4/3]' creates a uniform rectangle for every card. 
          'p-4' ensures the image never touches the edge. No gray background. */}
      <div className="relative w-full aspect-[4/3] flex items-center justify-center p-4 bg-white">
        <img 
            src={product.image_url} 
            alt={product.name} 
            // 'object-contain' keeps the whole image visible.
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Actions (Top Right) */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
             <button 
                onClick={toggleSave}
                className={`p-1.5 rounded-full shadow-sm transition-colors ${
                    isSaved ? 'bg-rose-50 text-rose-500' : 'bg-slate-100 text-slate-400 hover:text-rose-500'
                }`}
            >
                <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button 
                onClick={handleShare}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 shadow-sm hover:bg-slate-200"
            >
                <Share2 size={14} />
            </button>
        </div>

        {/* Badge (Top Left) */}
        <div className="absolute top-2 left-2 z-10">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm border
                ${product.store_count > 1 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : 'bg-white/90 text-slate-600 border-slate-200'}`}>
                <StoreIcon size={10} />
                {product.store_count > 1 ? `${storeCount} Stores` : '1 Store'}
            </div>
        </div>
      </div>
      
      {/* --- CONTENT AREA --- */}
      {/* KEY CHANGE 3: 'flex-grow' pushes the price section to the bottom regardless of content size */}
      <div className="flex h-full flex-col p-3 pt-0">
        
        {/* Category */}
        <div className={`text-[10px] uppercase font-bold tracking-wide mb-1
            ${isDarkMode ? 'text-teal-300' : 'text-slate-400'}`}>
            {product.category}
        </div>

        {/* Title */}
        {/* KEY CHANGE 4: 'min-h-[2.5rem]' reserves space for 2 lines of text. 
            This forces 1-line titles to take up the same space as 2-line titles, aligning the grid. */}
        <h3 className={`font-semibold text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem]
            ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {product.name}
        </h3>
        
        {/* Unit */}
        <div className={`text-xs mb-3 ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}>
            {product.unit}
        </div>
        
        {/* Footer (Price & Add) */}
        <div className="mt-auto flex items-end justify-between">
            <div className="flex flex-col">
                <span className={`text-[10px] ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`}>From</span>
                <div className="flex items-center gap-1">
                    <span className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-slate-900'}`}>
                        ${lowestPrice.toLocaleString()}
                    </span>
                    {isSimulated && (
                         <span className="text-[8px] uppercase font-extrabold text-amber-600 bg-amber-100 px-1 rounded border border-amber-200">
                            Beta
                        </span>
                    )}
                </div>
            </div>
            
            <button 
                onClick={(e) => { e.stopPropagation(); addToCart(product, storeOptions[0].id); }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95
                ${isDarkMode 
                  ? 'bg-emerald-500 text-teal-950' 
                  : 'bg-slate-900 text-white hover:bg-emerald-600'}`}
            >
                <Plus size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};
