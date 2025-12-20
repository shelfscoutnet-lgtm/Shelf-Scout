import React, { useMemo } from 'react';
import { Plus, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { RECIPES } from '../config/recipes';

interface Props {
  products: Product[];
}

export const ChefCorner: React.FC<Props> = ({ products }) => {
  const { addMultipleToCart } = useShop();
  const { isDarkMode } = useTheme();

  // Logic: For each keyword, find the product with the absolute lowest price variant
  const findBestMatch = (keyword: string, allProducts: Product[]) => {
    let best: { product: Product; storeId: string; price: number } | null = null;

    allProducts.forEach((p) => {
      const isMatch = p.name.toLowerCase().includes(keyword.toLowerCase()) || 
                      p.category.toLowerCase().includes(keyword.toLowerCase());
      
      if (isMatch) {
        Object.entries(p.prices).forEach(([sId, price]) => {
          if (!best || price < best.price) {
            best = { product: p, storeId: sId, price: Number(price) };
          }
        });
      }
    });
    return best;
  };

  // Build the bundles that have ALL items available
  const activeBundles = useMemo(() => {
    if (!products || products.length === 0) return [];

    return RECIPES.map((recipe) => {
      const matches: { product: Product; storeId: string; price: number }[] = [];
      let allFound = true;

      for (const keyword of recipe.keywords) {
        const match = findBestMatch(keyword, products);
        if (match) {
          matches.push(match);
        } else {
          allFound = false;
          break;
        }
      }

      if (!allFound) return null;

      const totalPrice = matches.reduce((sum, m) => sum + m.price, 0);
      return { ...recipe, matches, totalPrice };
    }).filter(Boolean);
  }, [products]);

  const handleAddBundle = (bundle: any) => {
    addMultipleToCart(
      bundle.matches.map((m: any) => ({ product: m.product, storeId: m.storeId }))
    );

    // Confetti celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#FCD34D']
    });
  };

  if (activeBundles.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          <Utensils size={18} className="mr-2 text-emerald-500" />
          Chef's Corner
          <span className="ml-2 text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Quick Add Bundles
          </span>
        </h3>
      </div>
      
      <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-4">
        {activeBundles.map((bundle: any) => (
          <div 
            key={bundle.id} 
            className={`min-w-[280px] max-w-[280px] rounded-2xl p-3 border shadow-sm flex flex-col relative ${
              isDarkMode ? 'bg-teal-900 border-teal-800' : 'bg-white border-slate-100'
            }`}
          >
            <div className="h-32 rounded-xl overflow-hidden mb-3 relative">
              <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-bold">
                {bundle.matches.length} items
              </div>
            </div>
            
            <div className="flex-1 mb-3">
              <h4 className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {bundle.emoji} {bundle.name}
              </h4>
              <p className={`text-[10px] mb-2 leading-relaxed ${isDarkMode ? 'text-teal-200' : 'text-slate-500'}`}>
                <span className="font-bold opacity-80">Includes: </span>
                {bundle.matches.map((m: any) => m.product.name).join(', ')}
              </p>
            </div>

            <button 
              onClick={() => handleAddBundle(bundle)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isDarkMode ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
              }`}
            >
              <Plus size={14} /> Add Bundle (${bundle.totalPrice.toLocaleString()})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};