export type VolunteerStatus = 'present' | 'absent' | 'undecided';

export interface VolunteerComment {
  id: string;
  content: string;
  createdAt: Date;
}

export interface Volunteer {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: VolunteerStatus;
  registrationDate: Date;
  token: string;
  comments: VolunteerComment[];
}

export interface VolunteerStats {
  total: number;
  present: number;
  absent: number;
  undecided: number;
}