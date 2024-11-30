import { z } from 'zod';

export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().min(1, "La description est requise"),
  location: z.string().min(1, "Le lieu est requis"),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide"),
  imageUrl: z.string().url("URL d'image invalide"),
  maxParticipants: z.number().min(1, "Le nombre maximum de participants doit être supérieur à 0"),
  currentParticipants: z.number().default(0),
});

export type Event = z.infer<typeof eventSchema>;

export interface Participant {
  id: string;
  name: string;
  email: string;
  eventId: string;
  registrationDate: Date;
}