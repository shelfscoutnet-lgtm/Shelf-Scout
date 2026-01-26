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
        
        // 1. METICULOUS QUERY: Joins products, prices, and stores
        let query = supabase.from('products').select(`
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

        // Filter by Parish ID (e.g., 'st-catherine')
        if (currentParish?.id) {
          query = query.eq('prices.stores.parish', currentParish.id);
        }
        
        // Filter by City (e.g., 'Portmore')
        if (selectedLocation && selectedLocation !== 'All') {
          query = query.eq('prices.stores.city', selectedLocation);
        }

        if (category && category !== 'All' && category !== null) {
          query = query.ilike('category', `%${category}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          // 2. METICULOUS MAPPING: Transform DB rows into PriceData objects
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
        console.error('Scout Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentParish?.id, selectedLocation]);

  return { products, loading };
};
