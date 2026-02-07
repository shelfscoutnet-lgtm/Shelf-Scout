import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSignups = (regionId?: string) => {
  const [signupCount, setSignupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch current count for THIS region only
  const fetchCount = async () => {
    if (!regionId) return;
    
    try {
      setLoading(true);
      let { count, error } = await supabase
        .from('signups')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId); // Filter by the specific region

      let usedLegacyColumn = false;
      if (error && error.message.includes('region_id')) {
        usedLegacyColumn = true;
        const fallback = await supabase
          .from('signups')
          .select('*', { count: 'exact', head: true })
          .eq('parish_id', regionId);

        count = fallback.count;
        error = fallback.error;
      }

      if (error) throw error;
      setSignupCount(count || 0);
      return usedLegacyColumn;
    } catch (err) {
      console.error('Error fetching signup count:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!regionId) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = async () => {
      const useLegacyColumn = await fetchCount();
      channel = supabase
        .channel(`public:signups:region:${regionId}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'signups',
            filter: useLegacyColumn ? `parish_id=eq.${regionId}` : `region_id=eq.${regionId}` 
          },
          () => {
            // Increment count locally for instant UI feedback
            setSignupCount(prev => prev + 1);
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [regionId]);

  // 3. Submit function that records the user's region
  const submitSignup = async (userData: { name: string; email: string; region_id: string }) => {
    try {
      const { error } = await supabase
        .from('signups')
        .insert([userData]);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Signup failed:', err);
      return { success: false, error: err };
    }
  };

  return { signupCount, loading, submitSignup };
};
