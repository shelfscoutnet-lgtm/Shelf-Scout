import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Store } from '../types';
import { STORES, PARISHES } from '../constants';

export const useStores = (parishName?: string) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      // Strict Logic: If no parish is selected, do not fetch any stores.
      if (!parishName) {
          setStores([]);
          return;
      }

      try {
        setLoading(true);
        
        let query = supabase.from('stores').select('*');

        // Logic for KSA Launch Strategy
        if (parishName === 'Kingston & St. Andrew') {
             // Query BOTH Kingston and St. Andrew
             query = query.in('parish', ['Kingston', 'St. Andrew']);
        } else {
             // Strict database filter for single parish name
             query = query.eq('parish', parishName);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data && data.length > 0) {
            const mappedStores: Store[] = data.map((s: any) => ({
                id: s.id,
                name: s.name,
                location: s.location || '',
                // Map database 'parish' column to our internal 'parish_id' property
                // For KSA launch, we map both to the active KSA ID, otherwise keep original
                parish_id: (parishName === 'Kingston & St. Andrew') ? 'jm-ksa' : (s.parish_id || s.parish),
                chain: s.chain || 'Independent',
                is_premium: s.is_premium || false,
                coords: s.latitude && s.longitude ? { lat: s.latitude, lng: s.longitude } : undefined
            }));
            setStores(mappedStores);
        } else {
            setStores([]);
        }
      } catch (err: any) {
        console.warn('Error fetching stores, using mock data:', err.message);
        
        // Fallback to Mock Data logic
        const parish = PARISHES.find(p => p.name === parishName);
        const parishId = parish ? parish.id : (parishName === 'Kingston & St. Andrew' ? 'jm-ksa' : null);

        if (parishId) {
            setStores(STORES.filter(s => s.parish_id === parishId));
        } else {
            setStores([]);
        }
        
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [parishName]);

  return { stores, loading, error };
};