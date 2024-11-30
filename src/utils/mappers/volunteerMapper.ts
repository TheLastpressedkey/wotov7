import type { Volunteer } from '../../types/volunteer';
import type { Database } from '../../types/supabase';

type ApiVolunteer = Database['public']['Tables']['volunteers']['Row'];
type ApiVolunteerInsert = Database['public']['Tables']['volunteers']['Insert'];

export function mapVolunteerFromApi(apiVolunteer: ApiVolunteer): Volunteer {
  return {
    id: apiVolunteer.id,
    eventId: apiVolunteer.event_id,
    firstName: apiVolunteer.first_name,
    lastName: apiVolunteer.last_name,
    phoneNumber: apiVolunteer.phone_number,
    status: apiVolunteer.status,
    registrationDate: new Date(apiVolunteer.registration_date),
    token: apiVolunteer.token,
  };
}

export function mapVolunteerToApi(volunteer: Omit<Volunteer, 'id' | 'registrationDate'>): ApiVolunteerInsert {
  return {
    event_id: volunteer.eventId,
    first_name: volunteer.firstName,
    last_name: volunteer.lastName,
    phone_number: volunteer.phoneNumber,
    status: volunteer.status,
    token: volunteer.token,
    registration_date: new Date().toISOString(),
  };
}