import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ServerAdminCheckResult {
  isServerAdmin: boolean;
  loading: boolean;
  error: string | null;
  revalidate: () => Promise<void>;
}

export const useServerAdminCheck = (): ServerAdminCheckResult => {
  const { session } = useAuth();
  const [isServerAdmin, setIsServerAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdminStatus = async () => {
    if (!session?.access_token) {
      setIsServerAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('verify-admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) {
        console.error('Admin verification error:', fnError);
        setError('Failed to verify admin status');
        setIsServerAdmin(false);
      } else {
        setIsServerAdmin(data?.isAdmin === true);
      }
    } catch (err) {
      console.error('Admin check failed:', err);
      setError('Admin verification failed');
      setIsServerAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [session?.access_token]);

  return {
    isServerAdmin,
    loading,
    error,
    revalidate: checkAdminStatus,
  };
};
