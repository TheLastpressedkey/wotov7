import { useState, useEffect } from 'react';
import { useEventStore } from '../store/eventStore';
import { useVolunteerStore } from '../store/volunteerStore';
import { useSupabaseStatus } from './useSupabaseStatus';

export function useInitialData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { fetchEvents, events } = useEventStore();
  const { fetchVolunteers } = useVolunteerStore();
  const connectionStatus = useSupabaseStatus();

  useEffect(() => {
    async function initData() {
      if (connectionStatus !== 'connected') return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        await fetchEvents();
        // Fetch volunteers for each event
        for (const event of events) {
          await fetchVolunteers(event.id);
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize data'));
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, [connectionStatus, fetchEvents, fetchVolunteers, events]);

  return {
    isLoading,
    error,
    connectionStatus,
  };
}