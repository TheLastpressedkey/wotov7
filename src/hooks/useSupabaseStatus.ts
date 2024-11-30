import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseStatus() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id')
          .limit(1);
        
        if (error) throw error;
        setStatus('connected');
      } catch (error) {
        console.error('Database connection error:', error);
        setStatus('error');
      }
    }

    checkConnection();
  }, []);

  return status;
}