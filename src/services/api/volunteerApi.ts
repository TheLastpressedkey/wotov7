import { supabase } from '../../lib/database';
import type { Database } from '../../types/supabase';

type ApiVolunteer = Database['public']['Tables']['volunteers']['Row'];
type ApiVolunteerInsert = Database['public']['Tables']['volunteers']['Insert'];

export const volunteerApi = {
  async getByEvent(eventId: string) {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching volunteers:', error);
      throw new Error(`Erreur lors de la récupération des bénévoles: ${error.message}`);
    }
    return data;
  },

  async create(volunteer: ApiVolunteerInsert) {
    const { data, error } = await supabase
      .from('volunteers')
      .insert([volunteer])
      .select()
      .single();

    if (error) {
      console.error('Error creating volunteer:', error);
      throw new Error(`Erreur lors de l'inscription: ${error.message}`);
    }

    return data;
  },

  async updateStatus(token: string, status: ApiVolunteer['status']) {
    const { data, error } = await supabase
      .from('volunteers')
      .update({ status })
      .eq('token', token)
      .select()
      .single();

    if (error) {
      console.error('Error updating volunteer status:', error);
      throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }

    return data;
  },

  async getByToken(token: string) {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      console.error('Error fetching volunteer by token:', error);
      throw new Error(`Erreur lors de la récupération du bénévole: ${error.message}`);
    }

    return data;
  },
};