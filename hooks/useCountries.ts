import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { COUNTRIES } from '../constants';
import { Country } from '../types';

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>(COUNTRIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('countries')
        .select('*')
        .order('name', { ascending: true });

      if (supabaseError) {
        setError(supabaseError.message);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const mapped = data.map((country: any) => ({
          id: country.id,
          name: country.name,
          code: country.code,
          currency: country.currency,
        }));
        setCountries(mapped);
      }

      setLoading(false);
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};
