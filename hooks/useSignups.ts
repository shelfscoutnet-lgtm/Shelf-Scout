import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSignups = (parishId?: string) => {
  const [signupCount, setSignupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch current count for THIS parish only
  const fetchCount = async () => {
    if (!parishId) return;
    
    try {
      setLoading(true);
      const { count, error } = await supabase
        .from('signups')
        .select('*', { count: 'exact', head: true })
        .eq('parish_id', parishId); // Filter by the specific parish

      if (error) throw error;
      setSignupCount(count || 0);
    } catch (err) {
      console.error('Error fetching signup count:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount();

    // 2. Realtime Subscription (filtered to this parish)
    // This ensures Portmore users don't see the bar move when a Kingston user joins
    const channel = supabase
      .channel(`public:signups:parish:${parishId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'signups',
          filter: `parish_id=eq.${parishId}` 
        },
        () => {
          // Increment count locally for instant UI feedback
          setSignupCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [parishId]);

  // 3. Submit function that records the user's parish
  const submitSignup = async (userData: { name: string; email: string; parish_id: string }) => {
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
