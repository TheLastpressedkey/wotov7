import { useCallback, useState } from 'react';
import { Volunteer } from '../types/volunteer';
import { volunteerService } from '../services/volunteerService';

export function useVolunteers(eventId: string) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVolunteers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getVolunteersByEvent(eventId);
      setVolunteers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch volunteers'));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const createVolunteer = async (volunteer: Omit<Volunteer, 'id' | 'token' | 'registrationDate'>) => {
    try {
      const newVolunteer = await volunteerService.createVolunteer(volunteer);
      setVolunteers(prev => [...prev, newVolunteer]);
      return newVolunteer;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create volunteer');
    }
  };

  const updateVolunteerStatus = async (token: string, status: Volunteer['status']) => {
    try {
      const updatedVolunteer = await volunteerService.updateVolunteerStatus(token, status);
      setVolunteers(prev => prev.map(volunteer => 
        volunteer.token === token ? updatedVolunteer : volunteer
      ));
      return updatedVolunteer;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update volunteer status');
    }
  };

  return {
    volunteers,
    loading,
    error,
    createVolunteer,
    updateVolunteerStatus,
    refetch: fetchVolunteers,
  };
}