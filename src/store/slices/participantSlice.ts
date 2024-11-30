import { StateCreator } from 'zustand';
import { Participant } from '../../types/event';

export interface ParticipantSlice {
  participants: Participant[];
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  getEventParticipants: (eventId: string) => Participant[];
}

export const createParticipantSlice: StateCreator<ParticipantSlice> = (set, get) => ({
  participants: [],
  addParticipant: (participant) =>
    set((state) => ({ participants: [...state.participants, participant] })),
  removeParticipant: (participantId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
    })),
  getEventParticipants: (eventId) =>
    get().participants.filter((p) => p.eventId === eventId),
});