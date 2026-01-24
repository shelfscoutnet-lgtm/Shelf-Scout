import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { useShop } from '../context/ShopContext'; 

export const useProducts = (category?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentParish, selectedLocation } = useShop();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // METICULOUS LOGIC: Fetch prices + Store Branch Details (Name & City)
        // This enables the "Branch Badge" feature for Portmore precision.
        let query = supabase
          .from('products')
          .select(`
            *,
            prices (
              store_id,
              price,
              gct_tag,
              stores!inner (
                name,
                parish,
                city
              )
            )
          `);

        // Filter by the selected Parish
        if (currentParish?.id) {
            query = query.eq('prices.stores.parish', currentParish.id);
        }

        // METICULOUS ADDITION: If the user selected a city like 'Portmore'
        if (selectedLocation && selectedLocation !== 'All') {
            query = query.eq('prices.stores.city', selectedLocation);
        }

        if (category && category !== 'All') {
            query = query.ilike('category', `%${category}%`);
        }

        const { data, error: supabaseError } = await query.order('name', { ascending: true });

        if (supabaseError) throw supabaseError;

        if (data) {
          const formattedProducts: Product[] = data.map((item: any) => ({
            ...item,
            // Organize prices and metadata (GCT + Branch Name) for the UI
            prices: item.prices?.reduce((acc: any, curr: any) => {
              acc[curr.store_id] = {
                val: curr.price,
                gct: curr.gct_tag,
                branch: `${curr.stores.name} - ${curr.stores.city}`
              };
              return acc;
            }, {}) || {}
          }));
          
          setProducts(formattedProducts);
        }
      } catch (err: any) {
        console.warn('Scout Fetch Failed:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentParish?.id, selectedLocation]);

  return { products, loading, error };
};
