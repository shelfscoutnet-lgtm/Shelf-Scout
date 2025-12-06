import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { Plus, ChevronDown, ChevronUp, MapPin, Share2, Heart, Check, Store as StoreIcon } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { STORES } from '../constants';
import { useTheme } from '../context/ThemeContext';

interface Props {
  product: Product;
  onClick?: () => void;
}

export const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const { currentParish, addToCart } = useShop();
  const { isDarkMode } = useTheme();
  const [showStoreList, setShowStoreList] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

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

  if (!currentParish) return null;

  // 1. Calculate Local Options
  const parishStores = STORES.filter(s => s.parish_id === currentParish.id);
  
  const storeOptions = parishStores
    .map(store => ({
      id: store.id,
      name: store.name,
      price: product.prices[store.id],
      chain: store.chain
    }))
    .filter(option => option.price !== undefined)
    .sort((a, b) => a.price - b.price); // Sort cheapest first by default

  if (storeOptions.length === 0) return null;

  // Determine active view (default to cheapest if none selected)
  const activeOption = selectedStoreId 
    ? storeOptions.find(s => s.id === selectedStoreId) || storeOptions[0]
    : storeOptions[0];

  const isBestPrice = activeOption.price === storeOptions[0].price;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}?product=${product.id}`;
    const text = `Check out ${product.name} at ${activeOption.name} for $${activeOption.price.toLocaleString()} on Shelf Scout!`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Shelf Scout Deal',
                text: text,
                url: url
            });
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

        {/* Best Price Badge - Only if currently viewing the cheapest option */}
        {isBestPrice && storeOptions.length > 1 && (
            <div className="absolute top-2 left-2 z-10">
                <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md flex items-center">
                    <Check size={10} className="mr-1" />
                    BEST PRICE
                </div>
            </div>
        )}
      </div>
      
      {/* Content Area */}
      <div className="p-3 flex flex-col flex-grow">
        <div className={`text-[10px] uppercase font-bold mb-1 tracking-wide ${isDarkMode ? 'text-teal-300' : 'text-slate-400'}`}>{product.category}</div>
        <h3 className={`font-semibold text-sm leading-tight mb-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
        <div className={`text-xs mb-3 ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}>{product.unit}</div>
        
        <div className="mt-auto">
            <div className="flex items-end justify-between">
                <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-baseline">
                        <div className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-slate-900'}`}>
                            ${activeOption.price.toLocaleString()}
                        </div>
                    </div>
                    
                    {/* Store Selector */}
                    <div className="relative">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowStoreList(!showStoreList);
                            }}
                            className={`flex items-center text-[10px] truncate max-w-full font-medium hover:underline ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}
                        >
                            @ {activeOption.name}
                            <ChevronDown size={12} className="ml-1 flex-shrink-0" />
                        </button>

                        {/* Dropdown Menu */}
                        {showStoreList && (
                            <div className={`absolute left-0 bottom-6 w-48 rounded-lg shadow-xl border z-20 overflow-hidden ${isDarkMode ? 'bg-teal-900 border-teal-700' : 'bg-white border-slate-200'}`}>
                                <div className={`px-2 py-1 text-[10px] font-bold uppercase border-b ${isDarkMode ? 'bg-teal-950 text-teal-400 border-teal-800' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                    Select Store
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                    {storeOptions.map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedStoreId(opt.id);
                                                setShowStoreList(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center transition-colors ${
                                                activeOption.id === opt.id 
                                                ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                                                : (isDarkMode ? 'text-teal-100 hover:bg-teal-800' : 'text-slate-600 hover:bg-slate-50')
                                            }`}
                                        >
                                            <span className="truncate mr-2">{opt.name}</span>
                                            <span className="font-semibold">${opt.price.toLocaleString()}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        // PASS THE SELECTED STORE ID TO CART
                        addToCart(product, selectedStoreId || undefined);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm flex-shrink-0 ${isDarkMode ? 'bg-emerald-500 hover:bg-emerald-400 text-teal-950' : 'bg-slate-900 hover:bg-emerald-600 text-white'}`}
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showStoreList && (
        <div 
            className="fixed inset-0 z-10 cursor-default" 
            onClick={(e) => {
                e.stopPropagation();
                setShowStoreList(false);
            }}
        />
      )}
    </div>
  );
};