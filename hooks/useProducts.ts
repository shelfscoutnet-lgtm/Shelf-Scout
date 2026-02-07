import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product, PriceData } from '../types';
import { useShop } from '../context/ShopContext'; 

export const useProducts = (category?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { currentRegion, selectedLocation } = useShop();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch raw data from Supabase
        const baseQuery = () => supabase.from('products').select(`
          *,
          prices (
            store_id, price, gct_tag,
            stores!inner ( name, region_id, parish, city )
          )
        `);

        // 2. Apply Filters
        let query = baseQuery();

        if (currentRegion?.id) {
          query = query.eq('prices.stores.region_id', currentRegion.id);
        }
        
        if (selectedLocation && selectedLocation !== 'All') {
          query = query.eq('prices.stores.city', selectedLocation);
        }

        if (category && category !== 'All') {
          query = query.ilike('category', `%${category}%`);
        }

        let { data, error } = await query;

        if (error && error.message.includes('region_id')) {
          let fallbackQuery = baseQuery();
          if (currentRegion?.id) {
            fallbackQuery = fallbackQuery.eq('prices.stores.parish', currentRegion.id);
          }
          if (selectedLocation && selectedLocation !== 'All') {
            fallbackQuery = fallbackQuery.eq('prices.stores.city', selectedLocation);
          }
          if (category && category !== 'All') {
            fallbackQuery = fallbackQuery.ilike('category', `%${category}%`);
          }
          const fallback = await fallbackQuery;
          data = fallback.data;
          error = fallback.error;
        }
        if (error) throw error;

        if (data) {
          // 3. Transform data to match types.ts
          const mapped: Product[] = data.map((item: any) => {
            const priceMap: Record<string, PriceData> = {};
            
            if (item.prices && Array.isArray(item.prices)) {
              item.prices.forEach((p: any) => {
                if (p.price !== null) {
                  priceMap[p.store_id] = {
                    val: Number(p.price),
                    gct: p.gct_tag || '',
                    branch: `${p.stores.name} (${p.stores.city})`
                  };
                }
              });
            }

            return {
              id: item.id,
              name: item.name,
              category: item.category,
              image_url: item.image_url,
              unit: item.unit,
              tags: item.tags || [],
              prices: priceMap
            };
          });
          
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentRegion?.id, selectedLocation]);

  return { products, loading };
};
