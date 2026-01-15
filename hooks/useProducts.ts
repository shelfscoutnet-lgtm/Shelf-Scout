import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { useShop } from '../context/ShopContext'; // New Import
import { PRODUCTS } from '../constants';

export const useProducts = (category?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // METICULOUS LOGIC: We now pull currentParish to filter data at the database level
  const { currentParish } = useShop();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // 1. Start the query. 
        // We removed '!inner' from prices so products stay visible even if no local price exists.
        let query = supabase
          .from('products')
          .select(`
            *,
            prices (
              store_id,
              price,
              stores!inner (
                parish
              )
            )
          `);

        // 2. Filter by Parish (The Crucial Fix)
        // This ensures the product only sees stores in the user's active parish.
        if (currentParish?.id) {
            query = query.eq('prices.stores.parish', currentParish.id);
        }

        // 3. Apply Category filter
        if (category && category !== 'All') {
            query = query.ilike('category', `%${category}%`);
        }

        const { data, error: supabaseError } = await query.order('name', { ascending: true });

        if (supabaseError) throw supabaseError;

        if (data) {
          const formattedProducts: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            category: item.category,
            image_url: item.image_url,
            unit: item.unit,
            tags: item.tags || [],
            // Transform only the local prices into the component's expected format
            prices: item.prices?.reduce((acc: Record<string, number>, curr: any) => {
              acc[curr.store_id] = curr.price;
              return acc;
            }, {}) || {}
          }));
          
          setProducts(formattedProducts);
        }
      } catch (err: any) {
        console.warn('Supabase fetch filtered by parish failed:', err.message);
        
        // Meticulous Fallback to mock data
        let fallback = PRODUCTS;
        if (category && category !== 'All') {
            fallback = fallback.filter(p => p.category === category);
        }
        setProducts(fallback);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentParish?.id]); // Re-run when category OR parish changes

  return { products, loading, error };
};
