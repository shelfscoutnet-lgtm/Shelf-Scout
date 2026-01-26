import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Store } from '../types';

export const useStores = (parishId?: string) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      // METICULOUS GUARD: Uses standardized ID (st-catherine) to prevent "No Data" bug
      if (!parishId) {
        setStores([]);
        return;
      }

      try {
        setLoading(true);
        // Fetching clean data columns to support Portmore Precision identification
        const { data, error: supabaseError } = await supabase
          .from('stores')
          .select('*')
          .eq('parish', parishId); 

        if (supabaseError) throw supabaseError;

        // MAP: Transfers database rows to our clean TypeScript objects
        const mappedStores: Store[] = (data || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          parish: s.parish,
          city: s.city || 'Unknown',
          location: s.location || ''
        }));

        setStores(mappedStores);
      } catch (err: any) {
        console.warn('Store Fetch Failed:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [parishId]);

  return { stores, loading, error };
};
