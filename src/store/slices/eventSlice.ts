import { StateCreator } from 'zustand';
import { Event } from '../../types/event';

export interface EventSlice {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  removeEvent: (id: string) => void;
}

export const createEventSlice: StateCreator<EventSlice> = (set) => ({
  events: [],
  addEvent: (event) => 
    set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      ),
    })),
  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),
});