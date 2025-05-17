import { Record } from 'pocketbase';

export interface UserRecord extends Record {
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface EventRecord extends Record {
  title: string;
  description?: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
  imageUrl?: string;
  maxParticipants: number;
  currentParticipants: number;
  archived: boolean;
}

export interface VolunteerRecord extends Record {
  eventId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: 'present' | 'absent' | 'undecided';
  token: string;
}

export interface VolunteerCommentRecord extends Record {
  volunteerId: string;
  content: string;
}