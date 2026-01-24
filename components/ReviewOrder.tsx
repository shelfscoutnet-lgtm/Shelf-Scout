import React, { useMemo } from 'react';
import { ShoppingBag, ChevronRight, TrendingDown, Store } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

export const ReviewOrder: React.FC = () => {
  const { cart, stores, selectedLocation, getCartTotal } = useShop();
  const { isDarkMode } = useTheme();

  // METICULOUS CALCULATION: Derive the "Best Local Total" [cite: 162]
  const stats = useMemo(() => {
    // 1. Identify only the stores in the selected city/branch area [cite: 158]
    const activeStoreIds = stores
      .filter(s => selectedLocation === 'All' || s.city === selectedLocation)
      .map(s => s.id);

    let bestTotal = 0;
    let worstTotal = 0;
    let itemsAnalyzed = 0;

    cart.forEach(item => {
      // Extract prices only for the stores we are currently "scouting" [cite: 163]
      const localPrices = Object.entries(item.prices)
        .filter(([storeId]) => activeStoreIds.includes(storeId))
        .map(([_, data]: [string, any]) => typeof data === 'object' ? data.val : data);

      if (localPrices.length > 0) {
        bestTotal += Math.min(...localPrices) * item.quantity;
        worstTotal += Math.max(...localPrices) * item.quantity;
        itemsAnalyzed++;
      }
    });

    return {
      bestTotal,
      savings: worstTotal - bestTotal,
      itemsAnalyzed
    };
  }, [cart, stores, selectedLocation]);

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40">
      <div className={`p-4 rounded-2xl shadow-2xl border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-900 border-slate-800 shadow-emerald-900/10' 
          : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {cart.length} Items in List
              </h4>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Store size={10} />
                Comparing {selectedLocation === 'All' ? 'All Areas' : selectedLocation} Outlets
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Best Total</div>
            <div className="text-xl font-black text-emerald-500 leading-none">
              ${stats.bestTotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* SAVINGS BANNER: Fulfills the "Demonstrate Savings" marketing goal [cite: 232] */}
        {stats.savings > 0 && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 mb-3">
            <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-bold">
              <TrendingDown size={14} />
              Potential Savings Detected
            </div>
            <span className="text-xs font-black text-emerald-600">
              Save ${stats.savings.toLocaleString()}
            </span>
          </div>
        )}

        <button className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
          Review Smart List
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
