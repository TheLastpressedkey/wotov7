import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { z } from 'zod';
import { Event } from '../../types/event';
import { Volunteer } from '../../types/volunteer';
import { Participant } from '../../types/event';

// Schema versions for data migration
const CURRENT_VERSION = 1;

// Zod schemas for type validation
const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  date: z.string(), // Store dates as ISO strings
  startTime: z.string(),
  endTime: z.string(),
  imageUrl: z.string(),
  maxParticipants: z.number(),
  currentParticipants: z.number(),
});

const volunteerSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phoneNumber: z.string(),
  status: z.enum(['present', 'absent', 'undecided']),
  registrationDate: z.string(), // Store dates as ISO strings
  token: z.string(),
});

const participantSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  eventId: z.string(),
  registrationDate: z.string(), // Store dates as ISO strings
});

const storeSchema = z.object({
  version: z.number(),
  events: z.array(eventSchema),
  volunteers: z.array(volunteerSchema),
  participants: z.array(participantSchema),
});

type Persistence = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  config: StateCreator<T, Mps, Mcs>,
  options: {
    name: string;
    version?: number;
    migrate?: (persistedState: unknown, version: number) => T;
  }
) => StateCreator<T, Mps, Mcs>;

export const persist: Persistence = (config, options) => (set, get, api) => {
  const persistKey = `wings-ocean-${options.name}`;

  // Load initial state
  const persistedState = localStorage.getItem(persistKey);
  let initialState = config(set, get, api);

  if (persistedState) {
    try {
      const parsed = JSON.parse(persistedState);
      const validated = storeSchema.parse(parsed);

      // Handle data migration if needed
      if (validated.version < CURRENT_VERSION && options.migrate) {
        initialState = options.migrate(validated, validated.version);
      } else {
        // Transform dates from ISO strings back to Date objects
        initialState = {
          ...validated,
          events: validated.events.map(event => ({
            ...event,
            date: new Date(event.date),
          })),
          volunteers: validated.volunteers.map(volunteer => ({
            ...volunteer,
            registrationDate: new Date(volunteer.registrationDate),
          })),
          participants: validated.participants.map(participant => ({
            ...participant,
            registrationDate: new Date(participant.registrationDate),
          })),
        };
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }

  // Subscribe to state changes
  api.subscribe((state) => {
    try {
      const serializedState = {
        version: CURRENT_VERSION,
        events: state.events.map(event => ({
          ...event,
          date: event.date.toISOString(),
        })),
        volunteers: state.volunteers.map(volunteer => ({
          ...volunteer,
          registrationDate: volunteer.registrationDate.toISOString(),
        })),
        participants: state.participants.map(participant => ({
          ...participant,
          registrationDate: participant.registrationDate.toISOString(),
        })),
      };

      localStorage.setItem(persistKey, JSON.stringify(serializedState));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  });

  return initialState;
};