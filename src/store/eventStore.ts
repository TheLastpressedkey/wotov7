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
      throw error;
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const updatedEvent = await eventService.updateEvent(id, updates);
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? updatedEvent : event
        ),
      }));
      return updatedEvent;
    } catch (error) {
      throw error;
    }
  },

  removeEvent: async (id) => {
    try {
      await eventService.deleteEvent(id);
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await eventService.getAllEvents();
      set({ events, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error('Failed to fetch events'), loading: false });
    }
  },
}));