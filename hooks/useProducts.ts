import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product, PriceData } from '../types';
import { useShop } from '../context/ShopContext'; 

export const useProducts = (category?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { currentParish, selectedLocation } = useShop();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase.from('products').select(`
          *,
          prices (
            store_id, price, gct_tag,
            stores!inner ( name, parish, city )
          )
        `);

        if (currentParish?.id) query = query.eq('prices.stores.parish', currentParish.id);
        if (selectedLocation && selectedLocation !== 'All') query = query.eq('prices.stores.city', selectedLocation);

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          const mapped: Product[] = data.map((item: any) => ({
            ...item,
            // METICULOUS MAPPING: Convert raw DB numbers into PriceData objects
            prices: item.prices?.reduce((acc: Record<string, PriceData>, curr: any) => {
              acc[curr.store_id] = {
                val: Number(curr.price),
                gct: curr.gct_tag || '',
                branch: `${curr.stores.name} (${curr.stores.city})`
              };
              return acc;
            }, {}) || {}
          }));
          setProducts(mapped);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProducts();
  }, [category, currentParish?.id, selectedLocation]);

  return { products, loading };
};
