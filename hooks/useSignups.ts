import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSignups = () => {
  const [signupCount, setSignupCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch total signups for the Goal Widget
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { count, error } = await supabase
          .from('signups')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        if (count !== null) {
          setSignupCount(count);
        }
      } catch (err) {
        // Fail silently/gracefully so the app doesn't crash
        console.warn('Signup fetch failed, using default', err);
        // We can set a fallback "visual" number if we want, or keep 0
        setSignupCount(0); 
      }
    };

    fetchCount();
  }, []);

  const submitSignup = async (data: { name: string; email: string; phone?: string; parish_id: string }) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('signups')
        .insert([data]);

      if (error) throw error;
      
      // Optimistic update
      setSignupCount(prev => prev + 1);
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