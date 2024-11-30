import { eventApi } from './api/eventApi';
import type { Event } from '../types/event';
import { mapEventFromApi, mapEventToApi } from '../utils/mappers/eventMapper';

export const eventService = {
  async getAllEvents(): Promise<Event[]> {
    const data = await eventApi.getAll();
    return data.map(mapEventFromApi);
  },

  async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    try {
      const apiEvent = mapEventToApi(event);
      const data = await eventApi.create(apiEvent);
      return mapEventFromApi(data);
    } catch (error) {
      console.error('Error in createEvent:', error);
      throw error;
    }
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const apiUpdates = mapEventToApi({ ...updates } as Event);
    const data = await eventApi.update(id, apiUpdates);
    return mapEventFromApi(data);
  },

  async deleteEvent(id: string): Promise<void> {
    await eventApi.delete(id);
  },
};