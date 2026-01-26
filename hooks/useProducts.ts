import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product, PriceData } from '../types';
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
                city,
                location
              )
            )
          `);

        // Filter by Parish ID (e.g., 'st-catherine')
        if (currentParish?.id) {
            query = query.eq('prices.stores.parish', currentParish.id);
        }

        // Filter by City (e.g., 'Portmore')
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
            id: item.id,
            name: item.name,
            category: item.category,
            image_url: item.image_url,
            unit: item.unit,
            tags: item.tags || [],
            // METICULOUS MAPPING: This creates the PriceData object structure
            // that types.ts is demanding.
            prices: item.prices?.reduce((acc: Record<string, PriceData>, curr: any) => {
              if (curr.price !== null) {
                acc[curr.store_id] = {
                  val: Number(curr.price),
                  gct: curr.gct_tag || '',
                  branch: `${curr.stores.name} (${curr.stores.city})`
                };
              }
              return acc;
            }, {}) || {}
          }));
          
          setProducts(formattedProducts);
        }
      } catch (err: any) {
        console.warn('Fetch error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentParish?.id, selectedLocation]);

  return { products, loading, error };
};
