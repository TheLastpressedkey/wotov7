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
          description: string | null
          location: string
          date: string
          start_time: string | null
          end_time: string | null
          image_url: string | null
          max_participants: number
          current_participants: number
          created_at: string
          archived: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location: string
          date: string
          start_time?: string | null
          end_time?: string | null
          image_url?: string | null
          max_participants: number
          current_participants?: number
          created_at?: string
          archived?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string
          date?: string
          start_time?: string | null
          end_time?: string | null
          image_url?: string | null
          max_participants?: number
          current_participants?: number
          created_at?: string
          archived?: boolean
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