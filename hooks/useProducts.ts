import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { useShop } from '../context/ShopContext'; 
import { PRODUCTS } from '../constants';

export const useProducts = (category?: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentParish, selectedLocation } = useShop();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // METICULOUS FIX: We now fetch the city from the stores table
        // so that the UI can filter prices by "Exact Location"
        let query = supabase
          .from('products')
          .select(`
            *,
            prices (
              store_id,
              price,
              stores!inner (
                parish,
                city
              )
            )
          `);

        if (currentParish?.id) {
            query = query.eq('prices.stores.parish', currentParish.id);
        }

        // Apply City Filter if user selected a specific area (e.g., "Pines")
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
            brand: item.brand,
            category: item.category,
            image_url: item.image_url,
            unit: item.unit,
            tags: item.tags || [],
            prices: item.prices?.reduce((acc: Record<string, number>, curr: any) => {
              acc[curr.store_id] = curr.price;
              return acc;
            }, {}) || {}
          }));
          
          setProducts(formattedProducts);
        }
      } catch (err: any) {
        console.warn('Fetch failed, using mock data:', err.message);
        setProducts(PRODUCTS);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentParish?.id, selectedLocation]); // Re-run when city changes!

  return { products, loading, error };
};
