export type VolunteerStatus = 'present' | 'absent' | 'undecided';

export interface Volunteer {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: VolunteerStatus;
  registrationDate: Date;
  token: string;
}

export interface VolunteerStats {
  total: number;
  present: number;
  absent: number;
  undecided: number;
}