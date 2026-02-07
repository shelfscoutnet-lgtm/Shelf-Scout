import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { REGIONS } from '../constants';
import { Region } from '../types';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>(REGIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });

      if (supabaseError) {
        setError(supabaseError.message);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const mapped = data.map((region: any) => ({
          id: region.id,
          name: region.name,
          slug: region.slug,
          countryId: region.country_id,
          coords: {
            lat: Number(region.lat),
            lng: Number(region.lng),
          },
          tier: region.tier,
          waitlistCount: region.waitlist_count ?? 0,
          launchReadiness: region.launch_readiness ?? 0,
        }));
        setRegions(mapped);
      }

      setLoading(false);
    };

    fetchRegions();
  }, []);

  return { regions, loading, error };
};
