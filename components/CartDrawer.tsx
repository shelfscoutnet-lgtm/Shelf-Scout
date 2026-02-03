import React, { useState, useMemo } from 'react';
import { ChevronDown, Minus, Plus, Trash2, TrendingDown, CheckSquare, Square, Share, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

export const CartDrawer: React.FC = () => {
  const { cart, cartItemCount, getCartTotal, primaryStore, updateCartItemQuantity, removeFromCart, stores } = useShop();
  const { isDarkMode } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cart' | 'checklist'>('cart');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const total = getCartTotal(primaryStore?.id);

  // --- CALCULATIONS ---
  const { bestTotal, worstTotal, savings } = useMemo(() => {
    let best = 0;
    let worst = 0;
    cart.forEach(item => {
      // FIX: Map objects to numbers using .val
      const prices = Object.values(item.prices).map(p => p.val);
      if (prices.length > 0) {
        best += Math.min(...prices) * item.quantity;
        worst += Math.max(...prices) * item.quantity;
      }
    });
    return { bestTotal, worstTotal, savings: worst - best };
  }, [cart]);

  const itemsByStore = useMemo(() => {
    const groups: Record<string, typeof cart> = {};
    cart.forEach(item => {
        const storeId = item.selectedStoreId || primaryStore?.id;
        if (!storeId) return;
        if (!groups[storeId]) groups[storeId] = [];
        groups[storeId].push(item);
    });
    return groups;
  }, [cart, primaryStore]);

  const involvedStores = useMemo(() => {
    return Object.keys(itemsByStore).map(id => stores.find(s => s.id === id)).filter(Boolean);
  }, [itemsByStore, stores]);

  // --- ACTIONS ---
  const toggleCheck = (itemId: string) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleShareList = async () => {
    let text = `🛒 *Shelf Scout Mission*\nEst. Total: $${total.toLocaleString()}\n\n`;
    involvedStores.forEach(store => {
        if (!store) return;
        const items = itemsByStore[store.id];
        // FIX: Extract .val for total calculation
        const storeTotal = items.reduce((sum, item) => sum + (item.prices[store.id]?.val || 0) * item.quantity, 0);
        text += `📍 *${store.name}* (~$${storeTotal.toLocaleString()})\n`;
        items.forEach(item => { text += `   [ ] ${item.quantity}x ${item.name}\n`; });
        text += `\n`;
    });
    if (navigator.share) {
        try { await navigator.share({ title: 'Shopping List', text }); } catch (err) { console.log('Share cancelled'); }
    } else {
        try { await navigator.clipboard.writeText(text); alert('List copied!'); } catch (err) {}
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className={`fixed bottom-16 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'h-[80vh]' : 'h-16'}`}>
      {isOpen && <div className="fixed inset-0 -z-10 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />}
      
      <div className={`w-full h-full flex flex-col rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] ${isDarkMode ? 'bg-teal-950 border-t border-teal-900' : 'bg-white border-t border-slate-100'}`}>
        {isOpen ? (
            <>
                <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-teal-800' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        {viewMode === 'checklist' && (
                            <button onClick={() => setViewMode('cart')} className={`p-1.5 rounded-full ${isDarkMode ? 'bg-teal-900' : 'bg-slate-100'}`}><ArrowLeft size={18} /></button>
                        )}
                        <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            {viewMode === 'checklist' ? 'Mission Checklist' : `Scout Basket (${cartItemCount})`}
                        </h2>
                    </div>
                    <button onClick={() => setIsOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-teal-900' : 'bg-slate-50'}`}><ChevronDown size={20} /></button>
                </div>

                {viewMode === 'cart' ? (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
                        {cart.map(item => {
                            const itemStoreId = item.selectedStoreId || primaryStore?.id || 'default';
                            // FIX: Safely access .val
                            const priceData = item.prices[itemStoreId];
                            const unitPrice = priceData?.val || 0;
                            const totalItemPrice = unitPrice * item.quantity;

                            return (
                                <div key={item.id} className={`flex items-center p-3 rounded-xl border ${isDarkMode ? 'bg-teal-900/40 border-teal-800' : 'bg-white border-slate-100'}`}>
                                    <div className="w-16 h-16 rounded-lg flex items-center justify-center p-1 mr-4 bg-white">
                                        <img src={item.image_url} className="h-full w-full object-contain" alt={item.name}/>
                                    </div>
                                    <div className="flex-1 min-w-0 mr-2">
                                        <h4 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.name}</h4>
                                        <div className={`text-xs mb-1 ${isDarkMode ? 'text-teal-400' : 'text-slate-500'}`}>
                                            ${unitPrice.toLocaleString()} ea
                                        </div>
                                        <div className="font-bold text-emerald-500 text-sm">${totalItemPrice.toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`flex items-center rounded-full h-8 px-1 border ${isDarkMode ? 'bg-teal-800 border-teal-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <button onClick={() => updateCartItemQuantity(item.id, -1)} className="w-7 h-full flex items-center justify-center"><Minus size={14} /></button>
                                            <span className={`text-xs font-bold w-4 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.quantity}</span>
                                            <button onClick={() => updateCartItemQuantity(item.id, 1)} className="w-7 h-full flex items-center justify-center"><Plus size={14} /></button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.id)} className="p-2"><Trash2 size={16} className="text-red-400" /></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-8">
                        {involvedStores.map(store => {
                            if (!store) return null;
                            const items = itemsByStore[store.id];
                            // FIX: Extract .val
                            const storeTotal = items.reduce((sum, item) => sum + ((item.prices[store.id]?.val || 0) * item.quantity), 0);
                            
                            return (
                                <div key={store.id} className={`rounded-2xl border ${isDarkMode ? 'bg-teal-900/20 border-teal-800' : 'bg-white border-slate-200'}`}>
                                    <div className={`p-4 flex justify-between items-center ${isDarkMode ? 'bg-teal-900/50' : 'bg-slate-50'}`}>
                                        <div className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{store.name}</div>
                                        <div className="text-xs text-emerald-500 font-bold">${storeTotal.toLocaleString()}</div>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-teal-800/50">
                                        {items.map(item => (
                                            <div key={item.id} onClick={() => toggleCheck(item.id)} className={`p-3 flex items-center cursor-pointer ${checkedItems[item.id] ? 'opacity-50' : ''}`}>
                                                <div className={`mr-3 ${checkedItems[item.id] ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                    {checkedItems[item.id] ? <CheckSquare size={22} /> : <Square size={22} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.quantity}x {item.name}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className={`p-6 pr-24 border-t ${isDarkMode ? 'bg-teal-950 border-teal-900' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={isDarkMode ? 'text-teal-300' : 'text-slate-600'}>Total Estimate</span>
                        <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>${total.toLocaleString()}</span>
                    </div>
                    {savings > 0 && <div className="text-xs text-emerald-500 font-bold flex items-center"><TrendingDown size={12} className="mr-1"/> Save ${savings.toLocaleString()}</div>}
                </div>

                <div className={`p-4 border-t pb-8 pr-24 ${isDarkMode ? 'bg-teal-950 border-teal-900' : 'bg-white border-slate-100'}`}>
                    <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg" onClick={() => setViewMode(viewMode === 'cart' ? 'checklist' : 'cart')}>
                        {viewMode === 'cart' ? 'Finalize List' : 'Share Mission'}
                    </button>
                </div>
            </>
        ) : (
            <div className="w-full h-full flex items-center px-4" onClick={() => setIsOpen(true)}>
                <div className="w-full bg-slate-900 text-white flex justify-between items-center px-4 py-3 pr-24 rounded-2xl cursor-pointer shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">{cartItemCount}</div>
                        <span className="font-semibold text-sm">Review Order</span>
                    </div>
                    <span className="font-bold text-lg">${total.toLocaleString()}</span>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
