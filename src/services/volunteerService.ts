import { volunteerApi } from './api/volunteerApi';
import { eventApi } from './api/eventApi';
import type { Volunteer } from '../types/volunteer';
import { mapVolunteerFromApi, mapVolunteerToApi } from '../utils/mappers/volunteerMapper';
import { generateToken } from '../utils/token';

export const volunteerService = {
  async getVolunteersByEvent(eventId: string): Promise<Volunteer[]> {
    try {
      const data = await volunteerApi.getByEvent(eventId);
      return data.map(mapVolunteerFromApi);
    } catch (error) {
      console.error('Error getting volunteers:', error);
      throw error;
    }
  },

  async createVolunteer(volunteer: Omit<Volunteer, 'id' | 'token' | 'registrationDate'>): Promise<Volunteer> {
    try {
      // Generate token first
      const token = generateToken();
      const apiVolunteer = mapVolunteerToApi({ ...volunteer, token });
      
      // Create volunteer first
      const data = await volunteerApi.create(apiVolunteer);
      
      // Only update participant count if the volunteer is marked as present
      if (volunteer.status === 'present') {
        await eventApi.updateParticipantCount(volunteer.eventId, true);
      }
      
      return mapVolunteerFromApi(data);
    } catch (error) {
      console.error('Error creating volunteer:', error);
      throw error;
    }
  },

  async updateVolunteerStatus(token: string, status: Volunteer['status']): Promise<Volunteer> {
    try {
      const currentVolunteer = await volunteerApi.getByToken(token);
      const data = await volunteerApi.updateStatus(token, status);
      
      // Update participant count based on status change
      if (currentVolunteer.status !== 'present' && status === 'present') {
        await eventApi.updateParticipantCount(currentVolunteer.event_id, true);
      } else if (currentVolunteer.status === 'present' && status !== 'present') {
        await eventApi.updateParticipantCount(currentVolunteer.event_id, false);
      }
      
      return mapVolunteerFromApi(data);
    } catch (error) {
      console.error('Error updating volunteer status:', error);
      throw error;
    }
  },
};
