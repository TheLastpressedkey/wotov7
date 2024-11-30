import { StateCreator } from 'zustand';
import { Volunteer, VolunteerStats } from '../../types/volunteer';

export interface VolunteerSlice {
  volunteers: Volunteer[];
  addVolunteer: (volunteer: Volunteer) => void;
  updateVolunteer: (token: string, updates: Partial<Volunteer>) => void;
  getVolunteersByEvent: (eventId: string) => Volunteer[];
  getVolunteerStats: (eventId: string) => VolunteerStats;
}

export const createVolunteerSlice: StateCreator<VolunteerSlice> = (set, get) => ({
  volunteers: [],
  addVolunteer: (volunteer) =>
    set((state) => ({ volunteers: [...state.volunteers, volunteer] })),
  updateVolunteer: (token, updates) =>
    set((state) => ({
      volunteers: state.volunteers.map((v) =>
        v.token === token ? { ...v, ...updates } : v
      ),
    })),
  getVolunteersByEvent: (eventId) =>
    get().volunteers.filter((v) => v.eventId === eventId),
  getVolunteerStats: (eventId) => {
    const eventVolunteers = get().getVolunteersByEvent(eventId);
    return {
      total: eventVolunteers.length,
      present: eventVolunteers.filter((v) => v.status === 'present').length,
      absent: eventVolunteers.filter((v) => v.status === 'absent').length,
      undecided: eventVolunteers.filter((v) => v.status === 'undecided').length,
    };
  },
});