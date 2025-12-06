import React, { useState, useMemo } from 'react';
import { ShoppingCart, X, ChevronUp, ChevronDown, Check, MapPin, ExternalLink, Navigation, Minus, Plus, Filter } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { STORES } from '../constants';
import { useTheme } from '../context/ThemeContext';

export const CartDrawer: React.FC = () => {
  const { cart, getCartTotal, primaryStore, updateCartItemQuantity } = useShop();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [filterStoreId, setFilterStoreId] = useState<string>('all');

  if (cart.length === 0) return null;

  const total = getCartTotal();
  const potentialSavings = total * 0.12; 

  // Detect which stores are involved in the current cart
  const involvedStoreIds = Array.from(new Set(cart.map(item => item.selectedStoreId || primaryStore?.id).filter(Boolean))) as string[];
  const involvedStores = involvedStoreIds.map(id => STORES.find(s => s.id === id)).filter(Boolean);

  // Filter items
  const displayCart = useMemo(() => {
      if (filterStoreId === 'all') return cart;
      return cart.filter(item => (item.selectedStoreId || primaryStore?.id) === filterStoreId);
  }, [cart, filterStoreId, primaryStore]);

  const openMap = (storeName: string) => {
    const query = encodeURIComponent(`${storeName} Jamaica`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className={`fixed bottom-16 left-0 right-0 z-40 transition-all duration-300 ${isOpen ? 'h-[80vh]' : 'h-16'}`}>
      
      {/* Expanded View */}
      {isOpen && (
        <div className={`absolute inset-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl flex flex-col border-t ${isDarkMode ? 'bg-teal-950 border-teal-900' : 'bg-white border-slate-100'}`}>
            
            {/* Header */}
            <div className={`p-4 border-b flex justify-between items-center rounded-t-3xl ${isDarkMode ? 'bg-teal-950 border-teal-800' : 'bg-white border-slate-100'}`}>
                <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Scout Basket ({cart.length})</h2>
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
                        const itemStore = STORES.find(s => s.id === itemStoreId);
                        const price = itemStoreId ? item.prices[itemStoreId] : 0;

                        return (
                            <div key={item.id} className={`flex justify-between items-center py-2 border-b last:border-0 ${isDarkMode ? 'border-teal-800' : 'border-slate-50'}`}>
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center p-1 flex-shrink-0 ${isDarkMode ? 'bg-teal-900' : 'bg-slate-50'}`}>
                                        <img src={item.image_url} className="h-full w-full object-contain mix-blend-multiply" alt=""/>
                                    </div>
                                    <div className="min-w-0 flex-1 mr-2">
                                        <div className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.name}</div>
                                        <div className={`text-xs flex items-center ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>
                                            {itemStore && (
                                                <span className={`text-[10px] px-1.5 rounded truncate max-w-[120px] ${isDarkMode ? 'bg-teal-900 text-teal-300' : 'bg-slate-100 text-slate-600'}`}>
                                                    @ {itemStore.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <div className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        ${(price * item.quantity).toLocaleString()}
                                    </div>
                                    {/* Quantity Controls */}
                                    <div className={`flex items-center rounded-lg ${isDarkMode ? 'bg-teal-800' : 'bg-slate-100'}`}>
                                        <button 
                                            onClick={() => updateCartItemQuantity(item.id, -1)}
                                            className="p-1 hover:text-emerald-500 transition-colors"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateCartItemQuantity(item.id, 1)}
                                            className="p-1 hover:text-emerald-500 transition-colors"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Logistics Route (Only show on 'All' tab or if filtered store matches) */}
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

            <div className={`p-6 border-t ${isDarkMode ? 'bg-teal-950 border-teal-900' : 'bg-slate-50 border-slate-200'}`}>
                 <div className="flex justify-between items-center mb-2">
                     <span className={`text-sm ${isDarkMode ? 'text-teal-300' : 'text-slate-500'}`}>Estimated Total</span>
                     <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>${total.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center text-xs text-emerald-600 bg-emerald-100 w-max px-2 py-1 rounded-full mb-4">
                    <Check size={12} className="mr-1" />
                    You're saving approx ${potentialSavings.toFixed(0)}
                 </div>
                 <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-colors">
                     Complete Shopping List
                 </button>
            </div>
        </div>
      )}

      {/* Collapsed Sticky Bar (Floating above nav) */}
      {!isOpen && (
        <div className="px-4 pb-2 w-full">
            <div 
                onClick={() => setIsOpen(true)}
                className="bg-slate-900 text-white flex justify-between items-center px-4 py-3 rounded-2xl cursor-pointer shadow-xl hover:bg-slate-800 transition-transform active:scale-95"
            >
                <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                        {cart.length}
                    </div>
                    <span className="font-semibold text-sm">View Basket</span>
                </div>
                <div className="flex items-center font-bold">
                    ${total.toLocaleString()}
                    <ChevronUp size={16} className="ml-2 text-slate-400"/>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};