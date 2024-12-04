import { create } from 'zustand';
import { Volunteer, VolunteerStats } from '../types/volunteer';
import { volunteerService } from '../services/volunteerService';

interface VolunteerStore {
  volunteers: Record<string, Volunteer[]>;
  loading: Record<string, boolean>;
  error: Record<string, Error | null>;
  addVolunteer: (volunteer: Omit<Volunteer, 'id' | 'token' | 'registrationDate' | 'comments'>) => Promise<Volunteer>;
  updateVolunteerStatus: (token: string, status: Volunteer['status']) => Promise<Volunteer>;
  addVolunteerComment: (token: string, content: string) => Promise<Volunteer>;
  getVolunteersByEvent: (eventId: string) => Volunteer[];
  getVolunteerStats: (eventId: string) => VolunteerStats;
  fetchVolunteers: (eventId: string) => Promise<void>;
}

export const useVolunteerStore = create<VolunteerStore>((set, get) => ({
  volunteers: {},
  loading: {},
  error: {},
  
  addVolunteer: async (volunteer) => {
    try {
      const newVolunteer = await volunteerService.createVolunteer(volunteer);
      set((state) => ({
        volunteers: {
          ...state.volunteers,
          [volunteer.eventId]: [
            ...(state.volunteers[volunteer.eventId] || []),
            newVolunteer,
          ],
        },
      }));
      return newVolunteer;
    } catch (error) {
      throw error;
    }
  },

  updateVolunteerStatus: async (token: string, status: Volunteer['status']) => {
    try {
      const updatedVolunteer = await volunteerService.updateVolunteerStatus(token, status);
      set((state) => {
        const eventId = updatedVolunteer.eventId;
        return {
          volunteers: {
            ...state.volunteers,
            [eventId]: state.volunteers[eventId].map((v) =>
              v.token === token ? updatedVolunteer : v
            ),
          },
        };
      });
      return updatedVolunteer;
    } catch (error) {
      throw error;
    }
  },

  addVolunteerComment: async (token: string, content: string) => {
    try {
      const updatedVolunteer = await volunteerService.addComment(token, content);
      set((state) => {
        const eventId = updatedVolunteer.eventId;
        return {
          volunteers: {
            ...state.volunteers,
            [eventId]: state.volunteers[eventId].map((v) =>
              v.token === token ? updatedVolunteer : v
            ),
          },
        };
      });
      return updatedVolunteer;
    } catch (error) {
      throw error;
    }
  },

  getVolunteersByEvent: (eventId: string) => {
    return get().volunteers[eventId] || [];
  },

  getVolunteerStats: (eventId: string) => {
    const eventVolunteers = get().getVolunteersByEvent(eventId);
    return {
      total: eventVolunteers.length,
      present: eventVolunteers.filter((v) => v.status === 'present').length,
      absent: eventVolunteers.filter((v) => v.status === 'absent').length,
      undecided: eventVolunteers.filter((v) => v.status === 'undecided').length,
    };
  },

  fetchVolunteers: async (eventId: string) => {
    set((state) => ({
      loading: { ...state.loading, [eventId]: true },
      error: { ...state.error, [eventId]: null },
    }));
    
    try {
      const volunteers = await volunteerService.getVolunteersByEvent(eventId);
      set((state) => ({
        volunteers: { ...state.volunteers, [eventId]: volunteers },
        loading: { ...state.loading, [eventId]: false },
      }));
    } catch (error) {
      set((state) => ({
        error: { 
          ...state.error, 
          [eventId]: error instanceof Error ? error : new Error('Failed to fetch volunteers')
        },
        loading: { ...state.loading, [eventId]: false },
      }));
    }
  },
}));
