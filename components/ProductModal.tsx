import React, { useState, useEffect, useMemo } from 'react';
import { X, ShoppingCart, MapPin, Bell, ArrowUpDown, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Store } from '../types';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { IS_BETA_MODE } from '../config';

interface Props {
  product: Product;
  onClose: () => void;
}

// Mock Logos for Store Chains
const CHAIN_LOGOS: Record<string, string> = {
  'HiLo': 'https://ui-avatars.com/api/?name=Hi+Lo&background=059669&color=fff&length=2&bold=true',
  'Progressive': 'https://ui-avatars.com/api/?name=PG&background=2563eb&color=fff&length=2&bold=true',
  'General Food': 'https://ui-avatars.com/api/?name=GF&background=dc2626&color=fff&length=2&bold=true',
  'Independent': 'https://ui-avatars.com/api/?name=Ind&background=64748b&color=fff&length=3&bold=true',
};

// Haversine distance helper
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

export const ProductModal: React.FC<Props> = ({ product, onClose }) => {
  const { currentParish, addToCart, addPriceAlert, removePriceAlert, priceAlerts, userCoords, stores } = useShop();
  const { isDarkMode } = useTheme();
  
  // Local state
  const [showAlertInput, setShowAlertInput] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [sortMode, setSortMode] = useState<'price' | 'distance'>('price');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const existingAlert = priceAlerts.find(a => a.productId === product.id);

  // Prepare Store Data
  const storeData = useMemo(() => {
    if (!currentParish) return [];

    const refLat = userCoords?.lat || currentParish.coords.lat;
    const refLng = userCoords?.lng || currentParish.coords.lng;

    return stores
        .map(store => {
            const price = product.prices[store.id];
            const dist = store.coords 
                ? calculateDistance(refLat, refLng, store.coords.lat, store.coords.lng)
                : 999;
            return { ...store, price, dist };
        })
        .filter(s => s.price !== undefined);
  }, [currentParish, product.prices, userCoords, stores]);

  // Calculate Best Price globally
  const bestPrice = useMemo(() => {
    if (storeData.length === 0) return 0;
    return Math.min(...storeData.map(s => s.price));
  }, [storeData]);

  // Sort Data
  const sortedStores = useMemo(() => {
      const data = [...storeData];
      if (sortMode === 'price') {
          return data.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else {
          return data.sort((a, b) => a.dist - b.dist);
      }
  }, [storeData, sortMode]);

  // Auto-select cheapest on load if nothing selected
  useEffect(() => {
      if (!selectedStoreId && sortedStores.length > 0) {
          setSelectedStoreId(sortedStores[0].id);
      }
  }, [sortedStores, selectedStoreId]);

  if (!currentParish) return null;

  const handleSetAlert = () => {
      const price = parseFloat(alertPrice);
      if (price > 0) {
          addPriceAlert(product.id, price);
          setShowAlertInput(false);
      }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        origin: { x, y },
        particleCount: 100,
        spread: 70,
        colors: ['#10B981', '#34D399', '#FCD34D'],
        zIndex: 1000 
      });

      addToCart(product, selectedStoreId || undefined);
      
      setIsAdded(true);
      setTimeout(() => {
          setIsAdded(false);
      }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isDarkMode ? 'bg-teal-950 text-white' : 'bg-white text-slate-900'
      }`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
        >
          <X size={20} />
        </button>

        {/* Hero Image */}
        <div className="h-64 w-full flex items-center justify-center p-8 bg-white">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="max-h-full object-contain mix-blend-multiply" 
          />
        </div>

        {/* Details */}
        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`}>
              {product.category} • {product.brand}
            </div>
            <h2 className="text-2xl font-bold leading-tight mb-2">{product.name}</h2>
            <div className="flex flex-wrap gap-2">
               {product.tags.map(tag => (
                   <span key={tag} className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                       isDarkMode ? 'bg-teal-800 text-teal-200' : 'bg-slate-100 text-slate-600'
                   }`}>
                       #{tag}
                   </span>
               ))}
            </div>
          </div>

          {/* Price Alert Section */}
          <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-teal-900' : 'bg-slate-50'}`}>
             <div className="flex justify-between items-center mb-2">
                 <h3 className="font-semibold text-sm">Price Watch</h3>
                 {existingAlert ? (
                     <button 
                         onClick={() => removePriceAlert(product.id)}
                         className="text-xs text-red-500 font-medium"
                     >
                         Remove Alert
                     </button>
                 ) : (
                     !showAlertInput && (
                         <button 
                            onClick={() => setShowAlertInput(true)}
                            className="text-xs text-emerald-600 font-bold flex items-center"
                         >
                             <Bell size={12} className="mr-1" /> Set Alert
                         </button>
                     )
                 )}
             </div>

             {existingAlert ? (
                 <div className="flex items-center text-sm text-emerald-500">
                     <Bell size={14} className="mr-2 fill-emerald-500" />
                     Alert set for prices below ${existingAlert.targetPrice}
                 </div>
             ) : showAlertInput ? (
                 <div className="flex gap-2">
                     <input 
                        type="number" 
                        value={alertPrice}
                        onChange={(e) => setAlertPrice(e.target.value)}
                        placeholder="Target Price"
                        className={`flex-1 p-2 rounded-lg text-sm border ${isDarkMode ? 'bg-teal-800 border-teal-700 text-white' : 'bg-white border-slate-200'}`}
                     />
                     <button 
                        onClick={handleSetAlert}
                        className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold"
                     >
                         Set
                     </button>
                 </div>
             ) : (
                 <p className={`text-xs ${isDarkMode ? 'text-teal-300' : 'text-slate-400'}`}>
                     Get notified when prices drop for this item.
                 </p>
             )}
          </div>

          {/* Store Comparison Header */}
          <div className="flex justify-between items-center mb-3">
             <h3 className="font-semibold text-sm opacity-80">Compare All Stores</h3>
             <button 
                onClick={() => setSortMode(prev => prev === 'price' ? 'distance' : 'price')}
                className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-teal-800 text-teal-200' : 'bg-slate-100 text-slate-600'
                }`}
             >
                 <ArrowUpDown size={12} className="mr-1" />
                 Sort by: {sortMode === 'price' ? 'Cheapest' : 'Closest'}
             </button>
          </div>

          {/* Store List */}
          <div className="space-y-2 mb-8">
            {sortedStores.map((item) => {
              const isSelected = selectedStoreId === item.id;
              const logoUrl = CHAIN_LOGOS[item.chain] || CHAIN_LOGOS['Independent'];
              const isBestPrice = item.price === bestPrice;
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedStoreId(item.id)}
                  className={`relative flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${
                     isSelected
                       ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500'
                       : (isDarkMode ? 'border-teal-800 bg-teal-900/50 hover:bg-teal-800' : 'border-slate-100 bg-slate-50 hover:bg-slate-100')
                  }`}
                >
                  <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                          isSelected ? 'border-emerald-500' : 'border-slate-300'
                      }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                      </div>

                      <img 
                        src={logoUrl} 
                        alt={item.chain}
                        className="w-8 h-8 rounded-full mr-3 border border-slate-100 shadow-sm object-cover"
                      />

                      <div>
                          <div className={`font-medium text-sm flex items-center ${isSelected ? 'text-emerald-600' : ''}`}>
                              {item.name}
                              {isBestPrice && (
                                  <span className="ml-2 text-[9px] bg-yellow-100 text-yellow-800 border border-yellow-200 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                      🏆 Best Price
                                  </span>
                              )}
                          </div>
                          <div className={`text-[10px] flex items-center ${isDarkMode ? 'text-teal-400' : 'text-slate-400'}`}>
                             <MapPin size={10} className="mr-1" /> {item.dist < 100 ? `${item.dist.toFixed(1)} km away` : (item.location || item.chain)}
                          </div>
                      </div>
                  </div>
                  <div className="text-right">
                      <div className={`font-bold ${isSelected ? 'text-emerald-500' : ''} ${IS_BETA_MODE ? 'opacity-60' : ''}`}>
                          ${item.price?.toLocaleString()}
                      </div>
                      {IS_BETA_MODE && (
                          <div className="text-[7px] uppercase font-extrabold text-amber-600 tracking-tighter">Simulated</div>
                      )}
                  </div>
                </div>
              );
            })}
            
            {sortedStores.length === 0 && (
                <div className="p-4 text-center opacity-50 text-sm">
                    No pricing available in this parish yet.
                </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-teal-900 bg-teal-950' : 'border-slate-100 bg-white'}`}>
             <button 
                onClick={handleAddToCart}
                disabled={sortedStores.length === 0}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all duration-300 shadow-lg ${
                    sortedStores.length === 0 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : isAdded
                        ? 'bg-emerald-500 text-white scale-[1.02]'
                        : 'bg-slate-900 hover:bg-emerald-600 text-white'
                }`}
             >
                 {isAdded ? (
                     <>
                        <CheckCircle size={20} className="mr-2" /> Added!
                     </>
                 ) : (
                     <>
                        <ShoppingCart size={18} className="mr-2" />
                        Add Selected ({sortedStores.length > 0 ? `$${(sortedStores.find(s => s.id === selectedStoreId)?.price || 0).toLocaleString()}` : '$0'})
                     </>
                 )}
             </button>
        </div>
      </div>
    </div>
  );
};
