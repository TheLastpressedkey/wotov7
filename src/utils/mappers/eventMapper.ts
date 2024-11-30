import type { Event } from '../../types/event';
import type { Database } from '../../types/supabase';

type ApiEvent = Database['public']['Tables']['events']['Row'] & {
  volunteers?: Array<{ status: string; event_id: string; }>;
};

export function mapEventFromApi(apiEvent: ApiEvent): Event {
  // Calculate present participants from volunteers
  const presentParticipants = apiEvent.volunteers?.filter(v => v.status === 'present').length || 0;

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
    currentParticipants: presentParticipants,
  };
}

export function mapEventToApi(event: Omit<Event, 'id'>): Omit<ApiEvent, 'id' | 'created_at' | 'volunteers'> {
  const dateStr = event.date instanceof Date 
    ? event.date.toISOString().split('T')[0]
    : new Date(event.date).toISOString().split('T')[0];

  return {
    title: event.title,
    description: event.description,
    location: event.location,
    date: dateStr,
    start_time: event.startTime,
    end_time: event.endTime,
    image_url: event.imageUrl,
    max_participants: event.maxParticipants,
    current_participants: event.currentParticipants ?? 0,
  };
}