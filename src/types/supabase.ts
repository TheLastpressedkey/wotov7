export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string
          location: string
          date: string
          start_time: string
          end_time: string
          image_url: string
          max_participants: number
          current_participants: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          location: string
          date: string
          start_time: string
          end_time: string
          image_url: string
          max_participants: number
          current_participants?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          location?: string
          date?: string
          start_time?: string
          end_time?: string
          image_url?: string
          max_participants?: number
          current_participants?: number
          created_at?: string
        }
      }
      volunteers: {
        Row: {
          id: string
          event_id: string
          first_name: string
          last_name: string
          phone_number: string
          status: 'present' | 'absent' | 'undecided'
          registration_date: string
          token: string
        }
        Insert: {
          id?: string
          event_id: string
          first_name: string
          last_name: string
          phone_number: string
          status?: 'present' | 'absent' | 'undecided'
          registration_date?: string
          token?: string
        }
        Update: {
          id?: string
          event_id?: string
          first_name?: string
          last_name?: string
          phone_number?: string
          status?: 'present' | 'absent' | 'undecided'
          registration_date?: string
          token?: string
        }
      }
    }
  }
}