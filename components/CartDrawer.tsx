// Fix: Added explicit typing to Object.values result and implemented detailed savings breakdown in footer
import React, { useState, useMemo } from 'react';
import { ShoppingCart, X, ChevronUp, ChevronDown, Check, MapPin, ExternalLink, Navigation, Minus, Plus, Filter, Trash2, TrendingDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

export const CartDrawer: React.FC = () => {
  const { cart, cartItemCount, getCartTotal, primaryStore, updateCartItemQuantity, removeFromCart, stores } = useShop();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [filterStoreId, setFilterStoreId] = useState<string>('all');

  const total = getCartTotal();

  // Calculate Real Potential Savings: Difference between the most expensive options and the cheapest ones
  const { bestTotal, worstTotal, savings } = useMemo(() => {
    let best = 0;
    let worst = 0;
    cart.forEach(item => {
      const prices = Object.values(item.prices) as number[];
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        best += min * item.quantity;
        worst += max * item.quantity;
      }
    });
    return { bestTotal: best, worstTotal: worst, savings: worst - best };
  }, [cart]);

  // Detect which stores are involved in the current cart
  const involvedStoreIds = useMemo(() => {
    return Array.from(new Set(cart.map(item => item.selectedStoreId || primaryStore?.id).filter(Boolean))) as string[];
  }, [cart, primaryStore?.id]);

  const involvedStores = useMemo(() => {
    return involvedStoreIds.map(id => stores.find(s => s.id === id)).filter(Boolean);
  }, [involvedStoreIds, stores]);

  // Filter items (moved up before potential return)
  const displayCart = useMemo(() => {
      if (filterStoreId === 'all') return cart;
      return cart.filter(item => (item.selectedStoreId || primaryStore?.id) === filterStoreId);
  }, [cart, filterStoreId, primaryStore]);

  const openMap = (storeName: string) => {
    const query = encodeURIComponent(`${storeName} Jamaica`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Safe early return after hooks
  if (cart.length === 0) return null;

  return (
    <div className={`fixed bottom-16 left-0 right-0 z-40 transition-all duration-300 ${isOpen ? 'h-[80vh]' : 'h-16'}`}>
      
      {/* Expanded View */}
      {isOpen && (
        <div className={`absolute inset-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl flex flex-col border-t ${isDarkMode ? 'bg-teal-950 border-teal-900' : 'bg-white border-slate-100'}`}>
            
            {/* Header */}
            <div className={`p-4 border-b flex justify-between items-center rounded-t-3xl ${isDarkMode ? 'bg-teal-950 border-teal-800' : 'bg-white border-slate-100'}`}>
                <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Scout Basket ({cartItemCount})</h2>
                <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-teal-900 text-teal-200' : 'bg-slate-50 text-slate-500'}`}>
                    <ChevronDown size={20} />
                </button>
            </div>

            {/* Filter Tabs */}
            {involvedStores.length > 1 && (
                <div className={`px-4 py-2 flex space-x-2 overflow-x-auto hide-scrollbar ${isDarkMode ? 'bg-teal-900/50' : 'bg-slate-50/50'}`}>
                    <button
                        onClick={() => setFilterStoreId('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                            filterStoreId === 'all' 
                            ? 'bg-emerald-500 text-white' 
                            : (isDarkMode ? 'bg-teal-800 text-teal-300' : 'bg-white text-slate-600 border border-slate-200')
                        }`}
                    >
                        All Stores
                    </button>
                    {involvedStores.map(store => (
                        <button
                            key={store?.id}
                            onClick={() => store && setFilterStoreId(store.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                                filterStoreId === store?.id
                                ? 'bg-emerald-500 text-white' 
                                : (isDarkMode ? 'bg-teal-800 text-teal-300' : 'bg-white text-slate-600 border border-slate-200')
                            }`}
                        >
                            {store?.name}
                        </button>
                    ))}
                </div>
            )}
            
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {displayCart.length === 0 ? (
                    <div className="text-center py-10 opacity-50">No items for this store.</div>
                ) : (
                    displayCart.map(item => {
                        const itemStoreId = item.selectedStoreId || primaryStore?.id;
                        const itemStore = stores.find(s => s.id === itemStoreId);
                        const unitPrice = itemStoreId ? item.prices[itemStoreId] : 0;
                        const totalItemPrice = unitPrice * item.quantity;

                        return (
                            <div key={item.id} className={`flex items-center p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-teal-900/40 border-teal-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                {/* Image */}
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center p-1 mr-4 flex-shrink-0 ${isDarkMode ? 'bg-teal-900' : 'bg-slate-50'}`}>
                                    <img src={item.image_url} className="h-full w-full object-contain mix-blend-multiply" alt=""/>
                                </div>

                                {/* Name & Price Info */}
                                <div className="flex-1 min-w-0 mr-2">
                                    <h4 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</h4>
                                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>
                                        ${unitPrice.toLocaleString()} ea
                                        {itemStore && (
                                            <span className="opacity-70 ml-1">@ {itemStore.chain}</span>
                                        )}
                                    </div>
                                    <div className={`font-bold text-emerald-500 text-sm`}>
                                        ${totalItemPrice.toLocaleString()}
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3">
                                    {/* Quantity Pill */}
                                    <div className={`flex items-center rounded-full h-8 px-1 border ${isDarkMode ? 'bg-teal-800 border-teal-700' : 'bg-slate-50 border-slate-200'}`}>
                                        <button 
                                            onClick={() => updateCartItemQuantity(item.id, -1)}
                                            className={`w-7 h-full flex items-center justify-center rounded-full hover:bg-black/5 transition-colors ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className={`text-xs font-bold w-4 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span>
                                        <button 
                                            onClick={() => updateCartItemQuantity(item.id, 1)}
                                            className={`w-7 h-full flex items-center justify-center rounded-full hover:bg-black/5 transition-colors ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Trash Icon */}
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-teal-600 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Logistics Route */}
                {involvedStores.length > 0 && (
                    <div className={`mt-6 rounded-xl p-4 border ${isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`flex items-center text-xs font-bold uppercase mb-3 ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>
                            <Navigation size={12} className="mr-1.5" /> 
                            {involvedStores.length > 1 ? 'Route Plan' : 'Store Location'}
                        </div>
                        <div className="space-y-2">
                            {involvedStores
                                .filter(s => filterStoreId === 'all' || s?.id === filterStoreId)
                                .map((store) => (
                                <button 
                                    key={store?.id}
                                    onClick={() => store && openMap(store.name)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border hover:border-emerald-400 hover:shadow-sm transition-all group ${
                                        isDarkMode ? 'bg-teal-950 border-teal-800' : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-colors ${
                                            isDarkMode ? 'bg-emerald-900 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'
                                        }`}>
                                            <MapPin size={14} />
                                        </div>
                                        <div className="text-left">
                                            <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{store?.name}</div>
                                            <div className={`text-[10px] ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>{store?.chain}</div>
                                        </div>
                                    </div>
                                    <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

           {/* Summary Footer with Potential Savings Hook */}
        <div className={`p-6 pr-24 border-t ${isDarkMode ? 'bg-teal-950 border-teal-900' : 'bg-slate-50 border-slate-200'}`}>
          <div className="space-y-1 mb-4">
            <div className="flex justify-between items-center text-slate-400 line-through text-sm">
              <span>Subtotal (Max)</span>
              <span>${worstTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className={isDarkMode ? 'text-teal-300' : 'text-slate-600'}>Best Possible Price</span>
              <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>${bestTotal.toLocaleString()}</span>
            </div>
          </div>
          {savings > 0 && (
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-emerald-500/10">
              <span className="text-emerald-500 font-bold flex items-center">
                <TrendingDown size={18} className="mr-1" /> Potential Savings
              </span>
              <span className="text-xl font-extrabold text-emerald-500">
                -${savings.toLocaleString()}
              </span>
            </div>
          )}
        </div>
                 <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-colors">
                     Complete Scouting List
                 </button>
            </div>
        </div>
      )}

      {/* Collapsed Sticky Bar (Floating above nav) */}
      {!isOpen && (
        <div className="px-4 pb-2 w-full">
          <div
            onClick={() => setIsOpen(true)}
            className="bg-slate-900 text-white flex justify-between items-center px-4 py-3 pr-24 rounded-2xl cursor-pointer shadow-lg hover:bg-slate-800 transition-colors"
          >
            {/* Left: Item Count & Label */}
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md text-white">
                {cartItemCount}
              </div>
              <span className="font-semibold text-sm">Review Order</span>
            </div>

            {/* Right: Price (Padded safely from Chatbot) */}
            <div className="flex flex-col items-end">
              <span className="font-bold text-lg">${total.toLocaleString()}</span>
              {savings > 0 && (
                <span className="text-emerald-400 text-[10px] font-bold">
                  Saved ${savings.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
