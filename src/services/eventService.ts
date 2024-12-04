import { eventApi } from './api/eventApi';
import type { Event } from '../types/event';
import { mapEventFromApi, mapEventToApi } from '../utils/mappers/eventMapper';

export const eventService = {
  async getAllEvents(): Promise<Event[]> {
    try {
      const data = await eventApi.getAll();
      return data.map(mapEventFromApi);
    } catch (error) {
      console.error('Error in getAllEvents:', error);
      throw error;
    }
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
    try {
      const apiUpdates = mapEventToApi({ ...updates } as Event);
      const data = await eventApi.update(id, apiUpdates);
      return mapEventFromApi(data);
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      await eventApi.delete(id);
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  },

  async toggleArchive(id: string, archived: boolean): Promise<Event> {
    try {
      const data = await eventApi.toggleArchive(id, archived);
      return mapEventFromApi(data);
    } catch (error) {
      console.error('Error in toggleArchive:', error);
      throw error;
    }
  }
};
