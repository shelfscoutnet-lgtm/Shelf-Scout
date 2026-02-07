import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const getAllowedEmails = () => {
  const raw = import.meta.env.VITE_ADMIN_EMAILS;
  if (!raw) return [];
  return raw.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

export const useAdminAccess = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError) {
          setError(authError.message);
          setIsAdmin(false);
          return;
        }
        const userEmail = data.user?.email?.toLowerCase();
        const allowlist = getAllowedEmails();
        setIsAdmin(Boolean(userEmail && allowlist.includes(userEmail)));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to verify admin access.');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return { isAdmin, loading, error };
};
