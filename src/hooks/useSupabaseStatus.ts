import { useState, useEffect } from 'react';
import { checkConnection } from '../lib/database';

export function useSupabaseStatus() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    async function verifyConnection() {
      try {
        const isConnected = await checkConnection();
        setStatus(isConnected ? 'connected' : 'error');
      } catch (error) {
        console.error('Database connection error:', error);
        setStatus('error');
      }
    }

    verifyConnection();
  }, []);

  return status;
}