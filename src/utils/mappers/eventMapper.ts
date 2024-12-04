import type { Event } from '../../types/event';
import type { Database } from '../../types/supabase';

type ApiEvent = Database['public']['Tables']['events']['Row'];

export function mapEventFromApi(apiEvent: ApiEvent): Event {
  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    location: apiEvent.location,
    date: new Date(apiEvent.date),
    startTime: apiEvent.start_time,
    endTime: apiEvent.end_time,
    imageUrl: apiEvent.image_url,
    maxParticipants: apiEvent.max_participants,
    currentParticipants: apiEvent.current_participants,
    archived: apiEvent.archived ?? false,
  };
}

export function mapEventToApi(event: Omit<Event, 'id'>): Omit<ApiEvent, 'id' | 'created_at'> {
  const dateStr = event.date instanceof Date 
    ? event.date.toISOString().split('T')[0]
    : new Date(event.date).toISOString().split('T')[0];

  return {
    title: event.title,
    description: event.description || null,
    location: event.location,
    date: dateStr,
    start_time: event.startTime || null,
    end_time: event.endTime || null,
    image_url: event.imageUrl || null,
    max_participants: event.maxParticipants,
    current_participants: event.currentParticipants ?? 0,
    archived: event.archived ?? false,
  };
}