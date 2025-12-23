import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { Plus, ChevronDown, ChevronUp, MapPin, Share2, Heart, Check, Store as StoreIcon, TrendingDown, AlertCircle } from 'lucide-react';
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

  // Badge Logic: Simulated only for Kingston & St. Andrew
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
        className={`cursor-pointer rounded-2xl border overflow-hidden flex flex-col h-full shadow-sm hover:shadow-lg transition-all relative group ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100'}`}
    >
      
      {/* Image Area */}
      <div className="h-32 w-full flex items-center justify-center p-4 relative bg-white">
        <img 
            src={product.image_url} 
            alt={product.name} 
            className="max-h-full object-contain mix-blend-multiply transition-transform group-hover:scale-105" 
        />
        
        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
            <button 
                onClick={toggleSave}
                className={`p-1.5 rounded-full transition-colors shadow-sm ${
                    isSaved 
                    ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-rose-500'
                }`}
                title={isSaved ? "Remove from saved" : "Save for later"}
            >
                <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
            </button>

            <button 
                onClick={handleShare}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm"
                title="Share deal"
            >
                <Share2 size={14} />
            </button>
        </div>

        {/* Store Count Badge */}
        <div className="absolute top-2 left-2 z-10">
            <div className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center border border-emerald-200">
                <StoreIcon size={10} className="mr-1" />
                Available at {storeCount} Store{storeCount !== 1 ? 's' : ''}
            </div>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-3 flex flex-col flex-grow">
        <div className={`text-[10px] uppercase font-bold mb-1 tracking-wide ${isDarkMode ? 'text-teal-300' : 'text-slate-400'}`}>{product.category}</div>
        <h3 className={`font-semibold text-sm leading-tight mb-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
        <div className={`text-xs mb-3 ${isDarkMode ? 'text-teal-200' : 'text-slate-50'}`}>{product.unit}</div>
        
        <div className="mt-auto">
            <div className="flex items-end justify-between">
                <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-baseline flex-wrap gap-x-1">
                        <span className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>From</span>
                        <div className={`text-lg font-bold flex items-center ${isDarkMode ? 'text-emerald-400' : 'text-slate-900'} ${isSimulated ? 'opacity-80' : ''}`}>
                            ${lowestPrice.toLocaleString()}
                        </div>
                        {isSimulated && (
                            <span className="text-[8px] uppercase tracking-tighter font-extrabold text-amber-600 bg-amber-100 px-1 rounded-sm border border-amber-200 leading-tight mb-1">
                                Simulated
                            </span>
                        )}
                    </div>
                </div>
                
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        addToCart(product, storeOptions[0].id);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm flex-shrink-0 ${isDarkMode ? 'bg-emerald-500 hover:bg-emerald-400 text-teal-950' : 'bg-slate-900 hover:bg-emerald-600 text-white'}`}
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};