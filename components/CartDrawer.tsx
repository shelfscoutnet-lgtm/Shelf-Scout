import React, { useState, useMemo } from 'react';
import { ChevronDown, MapPin, ExternalLink, Navigation, Minus, Plus, Trash2, TrendingDown, CheckSquare, Square, Share, ArrowLeft, Copy } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

export const CartDrawer: React.FC = () => {
  const { cart, cartItemCount, getCartTotal, primaryStore, updateCartItemQuantity, removeFromCart, stores } = useShop();
  const { isDarkMode } = useTheme();
  
  // UI States
  const [isOpen, setIsOpen] = useState(false);
  const [filterStoreId, setFilterStoreId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cart' | 'checklist'>('cart'); // New: Toggles between Edit and Shop modes
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({}); // New: Tracks checked off items

  const total = getCartTotal();

  // --- CALCULATIONS ---

  // Calculate Real Potential Savings
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

  // Group Items by Store for the Checklist
  const itemsByStore = useMemo(() => {
    const groups: Record<string, typeof cart> = {};
    cart.forEach(item => {
        // Determine which store this item is assigned to
        const storeId = item.selectedStoreId || primaryStore?.id;
        if (!storeId) return; // Should not happen if data is clean
        
        if (!groups[storeId]) groups[storeId] = [];
        groups[storeId].push(item);
    });
    return groups;
  }, [cart, primaryStore]);

  // Detect which stores are involved (for filtering/tabs)
  const involvedStoreIds = useMemo(() => Object.keys(itemsByStore), [itemsByStore]);

  const involvedStores = useMemo(() => {
    return involvedStoreIds.map(id => stores.find(s => s.id === id)).filter(Boolean);
  }, [involvedStoreIds, stores]);

  // Filter items for the Cart View
  const displayCart = useMemo(() => {
      if (filterStoreId === 'all') return cart;
      return cart.filter(item => (item.selectedStoreId || primaryStore?.id) === filterStoreId);
  }, [cart, filterStoreId, primaryStore]);

  // --- ACTIONS ---

  const openMap = (storeName: string) => {
    const query = encodeURIComponent(`${storeName} Jamaica`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleShareList = async () => {
    let text = `🛒 *Shelf Scout Mission*\nEst. Total: $${total.toLocaleString()}\n\n`;
    
    involvedStores.forEach(store => {
        if (!store) return;
        const items = itemsByStore[store.id];
        const storeTotal = items.reduce((sum, item) => sum + (item.prices[store.id] * item.quantity), 0);
        
        text += `📍 *${store.name}* (~$${storeTotal.toLocaleString()})\n`;
        items.forEach(item => {
            text += `   [ ] ${item.quantity}x ${item.name}\n`;
        });
        text += `\n`;
    });

    text += `Scouted via Shelf Scout JA`;

    if (navigator.share) {
        try { await navigator.share({ title: 'Shopping List', text }); } catch (err) { console.log('Share cancelled'); }
    } else {
        try { await navigator.clipboard.writeText(text); alert('List copied to clipboard!'); } catch (err) {}
    }
  };

  // Safe early return if empty
  if (cart.length === 0) return null;

  return (
    // Main Drawer Container
    <div className={`fixed bottom-16 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'h-[80vh]' : 'h-16'}`}>
      
      {/* Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 -z-10 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        />
      )}

      {/* The Drawer Card */}
      <div className={`w-full h-full flex flex-col rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-teal-950 border-t border-teal-900' : 'bg-white border-t border-slate-100'}`}>
        
        {/* === OPEN DRAWER CONTENT === */}
        {isOpen && (
            <>
                {/* Header */}
                <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-teal-800' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        {viewMode === 'checklist' && (
                            <button onClick={() => setViewMode('cart')} className={`p-1.5 rounded-full ${isDarkMode ? 'bg-teal-900 text-teal-200' : 'bg-slate-100 text-slate-600'}`}>
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div>
                            <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                {viewMode === 'checklist' ? 'Mission Checklist' : `Scout Basket (${cartItemCount})`}
                            </h2>
                            {viewMode === 'checklist' && <p className="text-xs text-emerald-500 font-medium">Ready to shop</p>}
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                         {viewMode === 'checklist' && (
                            <button onClick={handleShareList} className={`p-2 rounded-full ${isDarkMode ? 'bg-emerald-900 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                <Share size={20} />
                            </button>
                         )}
                        <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-teal-900 text-teal-200' : 'bg-slate-50 text-slate-500'}`}>
                            <ChevronDown size={20} />
                        </button>
                    </div>
                </div>

                {/* --- MODE 1: EDIT CART VIEW --- */}
                {viewMode === 'cart' && (
                    <>
                        {/* Filter Tabs (Only show if multiple stores involved) */}
                        {involvedStores.length > 1 && (
                            <div className={`px-4 py-3 flex space-x-2 overflow-x-auto hide-scrollbar border-b ${isDarkMode ? 'bg-teal-900/50 border-teal-800' : 'bg-slate-50/50 border-slate-100'}`}>
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

                        {/* Editable Items List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
                            {displayCart.map(item => {
                                const itemStoreId = item.selectedStoreId || primaryStore?.id;
                                const itemStore = stores.find(s => s.id === itemStoreId);
                                const unitPrice = itemStoreId ? item.prices[itemStoreId] : 0;
                                const totalItemPrice = unitPrice * item.quantity;

                                return (
                                    <div key={item.id} className={`flex items-center p-3 rounded-xl border transition-all ${isDarkMode ? 'bg-teal-900/40 border-teal-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center p-1 mr-4 flex-shrink-0 ${isDarkMode ? 'bg-teal-900' : 'bg-slate-50'}`}>
                                            <img src={item.image_url} className="h-full w-full object-contain mix-blend-multiply" alt={item.name}/>
                                        </div>
                                        <div className="flex-1 min-w-0 mr-2">
                                            <h4 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</h4>
                                            <div className={`text-xs mb-1 ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>
                                                ${unitPrice.toLocaleString()} ea
                                                {itemStore && <span className="opacity-70 ml-1">@ {itemStore.chain}</span>}
                                            </div>
                                            <div className={`font-bold text-emerald-500 text-sm`}>${totalItemPrice.toLocaleString()}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center rounded-full h-8 px-1 border ${isDarkMode ? 'bg-teal-800 border-teal-700' : 'bg-slate-50 border-slate-200'}`}>
                                                <button onClick={() => updateCartItemQuantity(item.id, -1)} className={`w-7 h-full flex items-center justify-center rounded-full hover:bg-black/5 ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}><Minus size={14} /></button>
                                                <span className={`text-xs font-bold w-4 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span>
                                                <button onClick={() => updateCartItemQuantity(item.id, 1)} className={`w-7 h-full flex items-center justify-center rounded-full hover:bg-black/5 ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}><Plus size={14} /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className={`p-2 rounded-full ${isDarkMode ? 'text-teal-600 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* --- MODE 2: CHECKLIST VIEW --- */}
                {viewMode === 'checklist' && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-8">
                        {involvedStores.map(store => {
                            if (!store) return null;
                            const items = itemsByStore[store.id];
                            const storeTotal = items.reduce((sum, item) => sum + (item.prices[store.id] * item.quantity), 0);
                            
                            return (
                                <div key={store.id} className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'bg-teal-900/20 border-teal-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                                    {/* Store Header */}
                                    <div className={`p-4 flex justify-between items-center ${isDarkMode ? 'bg-teal-900/50' : 'bg-slate-50'}`}>
                                        <div>
                                            <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{store.name}</div>
                                            <div className={`text-xs ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>Est. Pay: ${storeTotal.toLocaleString()}</div>
                                        </div>
                                        <button onClick={() => openMap(store.name)} className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 ${isDarkMode ? 'border-teal-700 text-teal-300 hover:bg-teal-800' : 'border-slate-200 text-slate-600 hover:bg-white'}`}>
                                            <Navigation size={12} /> Directions
                                        </button>
                                    </div>
                                    
                                    {/* Checklist Items */}
                                    <div className="divide-y divide-slate-100 dark:divide-teal-800/50">
                                        {items.map(item => {
                                            const isChecked = checkedItems[item.id];
                                            return (
                                                <div 
                                                    key={item.id} 
                                                    onClick={() => toggleCheck(item.id)}
                                                    className={`p-3 flex items-center cursor-pointer transition-colors hover:bg-black/5 ${isChecked ? 'opacity-50' : ''}`}
                                                >
                                                    <div className={`mr-3 ${isChecked ? 'text-emerald-500' : (isDarkMode ? 'text-teal-700' : 'text-slate-300')}`}>
                                                        {isChecked ? <CheckSquare size={22} /> : <Square size={22} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`text-sm font-medium ${isChecked ? 'line-through text-slate-400' : (isDarkMode ? 'text-white' : 'text-slate-800')}`}>
                                                            {item.quantity}x {item.name}
                                                        </div>
                                                        <div className="text-xs text-emerald-600 font-bold">${item.prices[store.id].toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer Section: Totals */}
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
                            <span className="text-xl font-extrabold text-emerald-500">-${savings.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {/* Main Action Button */}
                <div className={`p-4 border-t pb-8 pr-24 ${isDarkMode ? 'bg-teal-950 border-teal-900' : 'bg-white border-slate-100'}`}>
                    {viewMode === 'cart' ? (
                        <button 
                            className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex justify-between items-center hover:bg-slate-800 transition-all active:scale-95"
                            onClick={() => setViewMode('checklist')}
                        >
                            <span>Finalize Scouting List</span>
                            <span className="bg-slate-800 py-1 px-3 rounded-lg text-sm">${total.toLocaleString()}</span>
                        </button>
                    ) : (
                        <button 
                            className="w-full bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex justify-center items-center hover:bg-emerald-600 transition-all active:scale-95 gap-2"
                            onClick={handleShareList}
                        >
                            <Share size={18} /> Share Mission List
                        </button>
                    )}
                </div>
            </>
        )}

        {/* === COLLAPSED VIEW (Sticky Bar) === */}
        {!isOpen && (
            <div className="w-full h-full flex items-center px-4">
                <div
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-slate-900 text-white flex justify-between items-center px-4 py-3 pr-24 rounded-2xl cursor-pointer shadow-lg hover:bg-slate-800 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md text-white">
                            {cartItemCount}
                        </div>
                        <span className="font-semibold text-sm">Review Order</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-bold text-lg">${total.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
