import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { PRODUCTS } from '../constants';

export const useProducts = (category?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Use !inner on prices to ensure we ONLY get products that have at least one price record.
        // This effectively filters out "empty" products that might exist in the DB but have no prices.
        let query = supabase
          .from('products')
          .select(`
            *,
            prices!inner (
              store_id,
              price
            )
          `);

        // Apply category filter if present
        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data && data.length > 0) {
          const formattedProducts: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            category: item.category,
            image_url: item.image_url,
            unit: item.unit,
            tags: item.tags || [],
            // Transform the Supabase relation array
            prices: item.prices?.reduce((acc: Record<string, number>, curr: any) => {
              acc[curr.store_id] = curr.price;
              return acc;
            }, {}) || {}
          }));
          setProducts(formattedProducts);
        } else {
          setProducts([]); 
        }
      } catch (err: any) {
        console.warn('Supabase fetch failed, using mock data:', err.message);
        // Fallback to mock data on error so the app works
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
  }, [category]); // Re-run when category changes

  return { products, loading, error };
};