import React from 'react';
import { Plus } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';

interface Bundle {
  id: string;
  name: string;
  image: string;
  price: number;
  items: string[];
  itemCount: number;
  emoji: string;
}

interface Props {
  products?: any[]; // Optional prop if you eventually pass real products
}

export const ChefCorner: React.FC<Props> = ({ products }) => {
  const { addToCart, cart } = useShop();
  const { isDarkMode } = useTheme();

  // --- HARDCODED BUNDLES (Since they don't exist in DB yet) ---
  const bundles: Bundle[] = [
    {
      id: 'bundle-survival',
      name: 'Survival Kit',
      // UPDATED: Using your live Supabase Storage Link
      image: 'https://zwulphqqstyywybeyleu.supabase.co/storage/v1/object/public/Products/bundle-survival-kit.jpeg',
      price: 440.17,
      items: ['Grace Corned Beef (12oz)', 'Lasco Water Crackers (300g)'],
      itemCount: 2,
      emoji: '🛠️'
    },
    {
      id: 'bundle-easter',
      name: 'Easter Preview',
      // UPDATED: Using your live Supabase Storage Link
      image: 'https://zwulphqqstyywybeyleu.supabase.co/storage/v1/object/public/Products/bundle-easter-preview.jpeg',
      price: 534.08,
      items: ['Tastee Cheese (2.2lb Tin)', 'Holsum Spice Bun (125g)'],
      itemCount: 2,
      emoji: '🧀'
    }
  ];

  const handleAddBundle = (bundle: Bundle) => {
    // 1. Create a "fake" product object for the cart
    const bundleProduct = {
      id: bundle.id,
      name: bundle.name,
      image_url: bundle.image, // Ensure this matches your Cart's expected field
      prices: { 'default': bundle.price }, // Mock price structure
      category: 'Bundle'
    };

    // 2. Add it to the cart
    // Note: Since 'addToCart' expects a specific Product type, we might need to cast it
    // or ensure your Context handles custom items. For now, we mock the structure.
    addToCart(bundleProduct as any);
  };

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-4 px-4">
        <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
          👨‍🍳 Chef's Corner
        </h2>
        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          Quick Add Bundles
        </span>
      </div>

      <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-4 px-4">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            // UPDATED THEME: Switched from 'bg-teal-900' to 'bg-slate-800' for a cleaner look
            className={`min-w-[280px] max-w-[280px] rounded-2xl p-3 border shadow-sm flex flex-col relative ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
            }`}
          >
            {/* Image Container */}
            <div className="h-32 rounded-xl overflow-hidden mb-3 relative group">
              <img 
                src={bundle.image} 
                alt={bundle.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-lg">
                {bundle.itemCount} Items
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 mb-3">
              <h4 className={`font-bold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {bundle.emoji} {bundle.name}
              </h4>
              <p className={`text-[10px] mb-2 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="font-bold opacity-80">Includes: </span>
                {bundle.items.join(', ')}
              </p>
            </div>

            {/* Add Button */}
            <button
              onClick={() => handleAddBundle(bundle)}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
            >
              <Plus size={16} />
              Add Bundle (${bundle.price.toLocaleString()})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
