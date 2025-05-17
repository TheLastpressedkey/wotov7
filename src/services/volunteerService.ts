import { volunteerApi } from './api/volunteerApi';
import { eventApi } from './api/eventApi';
import type { Volunteer, VolunteerComment } from '../types/volunteer';
import { mapVolunteerFromApi, mapVolunteerToApi } from '../utils/mappers/volunteerMapper';
import { generateToken } from '../utils/token';

export const volunteerService = {
  async getVolunteersByEvent(eventId: string): Promise<Volunteer[]> {
    try {
      const { volunteers, comments } = await volunteerApi.getByEvent(eventId);
      return volunteers.map(volunteer => ({
        ...mapVolunteerFromApi(volunteer),
        comments: (comments[volunteer.token] || []).map(comment => ({
          id: comment.id,
          content: comment.content,
          createdAt: new Date(comment.created_at),
        })),
      }));
    } catch (error) {
      console.error('Error getting volunteers:', error);
      throw error;
    }
  },

  async createVolunteer(volunteer: Omit<Volunteer, 'id' | 'token' | 'registrationDate' | 'comments'>): Promise<Volunteer> {
    try {
      const token = generateToken();
      const apiVolunteer = mapVolunteerToApi({ ...volunteer, token });
      
      const data = await volunteerApi.create(apiVolunteer);
      
      if (volunteer.status === 'present') {
        await eventApi.updateParticipantCount(volunteer.eventId, true);
      }
      
      return {
        ...mapVolunteerFromApi(data),
        comments: [],
      };
    } catch (error) {
      console.error('Error creating volunteer:', error);
      throw error;
    }
  },

  async updateVolunteerStatus(token: string, status: Volunteer['status']): Promise<Volunteer> {
    try {
      const { volunteer: currentVolunteer, comments } = await volunteerApi.getByToken(token);
      const data = await volunteerApi.updateStatus(token, status);
      
      if (currentVolunteer.status !== 'present' && status === 'present') {
        await eventApi.updateParticipantCount(currentVolunteer.event_id, true);
      } else if (currentVolunteer.status === 'present' && status !== 'present') {
        await eventApi.updateParticipantCount(currentVolunteer.event_id, false);
      }
      
      return {
        ...mapVolunteerFromApi(data),
        comments: comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          createdAt: new Date(comment.created_at),
        })),
      };
    } catch (error) {
      console.error('Error updating volunteer status:', error);
      throw error;
    }
  },

  async addComment(token: string, content: string): Promise<Volunteer> {
    try {
      const comment = await volunteerApi.addComment(token, content);
      const { volunteer, comments } = await volunteerApi.getByToken(token);
      
      return {
        ...mapVolunteerFromApi(volunteer),
        comments: comments.map(c => ({
          id: c.id,
          content: c.content,
          createdAt: new Date(c.created_at),
        })),
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
};