import { create } from 'zustand';
import { Event } from '../types/event';
import { eventService } from '../services/eventService';

interface EventStore {
  events: Event[];
  loading: boolean;
  error: Error | null;
  addEvent: (event: Omit<Event, 'id'>) => Promise<Event>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<Event>;
  removeEvent: (id: string) => Promise<void>;
  toggleArchive: (id: string, archived: boolean) => Promise<Event>;
  fetchEvents: () => Promise<void>;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  loading: false,
  error: null,

  addEvent: async (event) => {
    try {
      const newEvent = await eventService.createEvent(event);
      set((state) => ({ events: [...state.events, newEvent] }));
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error instanceof Error ? error : new Error('Failed to add event');
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const updatedEvent = await eventService.updateEvent(id, updates);
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? { ...event, ...updatedEvent } : event
        ),
      }));
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error instanceof Error ? error : new Error('Failed to update event');
    }
  },

  removeEvent: async (id) => {
    try {
      await eventService.deleteEvent(id);
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
      }));
    } catch (error) {
      console.error('Error removing event:', error);
      throw error instanceof Error ? error : new Error('Failed to remove event');
    }
  },

  toggleArchive: async (id, archived) => {
    try {
      const updatedEvent = await eventService.toggleArchive(id, archived);
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? { ...event, ...updatedEvent } : event
        ),
      }));
      return updatedEvent;
    } catch (error) {
      console.error('Error toggling archive:', error);
      throw error instanceof Error ? error : new Error('Failed to toggle archive status');
    }
  },

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await eventService.getAllEvents();
      set({ events, loading: false });
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch events'), 
        loading: false 
      });
    }
  },
}));
