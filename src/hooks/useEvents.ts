import { useCallback, useState } from 'react';
import { Event } from '../types/event';
import { eventService } from '../services/eventService';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = async (event: Omit<Event, 'id'>) => {
    try {
      const newEvent = await eventService.createEvent(event);
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create event');
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const updatedEvent = await eventService.updateEvent(id, updates);
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
      return updatedEvent;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update event');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete event');
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}