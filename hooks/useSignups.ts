import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// We now accept an optional 'currentParishId'
export const useSignups = (currentParishId?: string) => {
  const [signupCount, setSignupCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch signups (Filtered by Parish if an ID is provided)
  useEffect(() => {
    const fetchCount = async () => {
      try {
        // Start the query
        let query = supabase
          .from('signups')
          .select('*', { count: 'exact', head: true });
        
        // IF a parish is selected, only count signups for that parish
        if (currentParishId) {
          query = query.eq('parish_id', currentParishId);
        }

        const { count, error } = await query;
        
        if (error) throw error;
        
        if (count !== null) {
          setSignupCount(count);
        }
      } catch (err) {
        console.warn('Signup fetch failed, using default', err);
        setSignupCount(0); 
      }
    };

    fetchCount();
  }, [currentParishId]); // Re-run this whenever the parish changes

  const submitSignup = async (data: { name: string; email: string; phone?: string; parish_id: string }) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('signups')
        .insert([data]);

      if (error) throw error;
      
      // Optimistic update (Only add 1 if it matches the current view)
      if (data.parish_id === currentParishId) {
        setSignupCount(prev => prev + 1);
      }
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return { signupCount, submitSignup, loading };
};
