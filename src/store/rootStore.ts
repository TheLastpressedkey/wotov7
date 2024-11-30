import { create } from 'zustand';
import { EventSlice, createEventSlice } from './slices/eventSlice';
import { ParticipantSlice, createParticipantSlice } from './slices/participantSlice';
import { VolunteerSlice, createVolunteerSlice } from './slices/volunteerSlice';
import { persist } from './middleware/persist';

type RootStore = EventSlice & ParticipantSlice & VolunteerSlice;

export const useStore = create<RootStore>()(
  persist(
    (...args) => ({
      ...createEventSlice(...args),
      ...createParticipantSlice(...args),
      ...createVolunteerSlice(...args),
    }),
    {
      name: 'root-store',
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        // Handle future migrations here
        return persistedState as RootStore;
      },
    }
  )
);