import { z } from 'zod';

export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional().default(""),
  location: z.string().min(1, "Le lieu est requis"),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide").optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide").optional(),
  imageUrl: z.string().url("URL d'image invalide").optional(),
  maxParticipants: z.number().min(1, "Le nombre maximum de participants doit être supérieur à 0"),
  currentParticipants: z.number().default(0),
  archived: z.boolean().default(false),
});

export type Event = z.infer<typeof eventSchema>;

export interface Participant {
  id: string;
  name: string;
  email: string;
  eventId: string;
  registrationDate: Date;
}

export type EventFilter = 'all' | 'upcoming' | 'past' | 'archived';
