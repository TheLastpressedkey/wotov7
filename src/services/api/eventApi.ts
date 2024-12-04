import { supabase } from '../../lib/database';
import type { Database } from '../../types/supabase';

type ApiEvent = Database['public']['Tables']['events']['Row'];

export const eventApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      throw new Error(`Erreur lors de la récupération des événements: ${error.message}`);
    }
    return data;
  },

  async create(event: Omit<ApiEvent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      throw new Error(`Erreur lors de la création de l'événement: ${error.message}`);
    }

    return data;
  },

  async update(id: string, updates: Partial<ApiEvent>) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw new Error(`Erreur lors de la mise à jour de l'événement: ${error.message}`);
    }

    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw new Error(`Erreur lors de la suppression de l'événement: ${error.message}`);
    }
  },

  async updateParticipantCount(id: string, increment: boolean = true) {
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('current_participants, max_participants')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching event:', fetchError);
      throw new Error(`Erreur lors de la récupération de l'événement: ${fetchError.message}`);
    }

    const newCount = increment 
      ? event.current_participants + 1 
      : Math.max(0, event.current_participants - 1);

    if (increment && newCount > event.max_participants) {
      throw new Error('Maximum number of participants reached');
    }

    const { error: updateError } = await supabase
      .from('events')
      .update({ current_participants: newCount })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating participant count:', updateError);
      throw new Error(`Erreur lors de la mise à jour du nombre de participants: ${updateError.message}`);
    }
  },

  async toggleArchive(id: string, archived: boolean) {
    const { data, error } = await supabase
      .from('events')
      .update({ archived })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling archive status:', error);
      throw new Error(`Erreur lors de la modification du statut d'archive: ${error.message}`);
    }

    return data;
  }
};