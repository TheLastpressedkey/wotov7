import { supabase } from '../../lib/database';
import type { Database } from '../../types/supabase';
import type { VolunteerComment } from '../../types/volunteer';

type ApiVolunteer = Database['public']['Tables']['volunteers']['Row'];
type ApiVolunteerInsert = Database['public']['Tables']['volunteers']['Insert'];
type ApiComment = Database['public']['Tables']['volunteer_comments']['Row'];

export const volunteerApi = {
  async getByEvent(eventId: string) {
    const { data: volunteers, error: volunteersError } = await supabase
      .from('volunteers')
      .select('*')
      .eq('event_id', eventId);

    if (volunteersError) {
      console.error('Error fetching volunteers:', volunteersError);
      throw new Error(`Erreur lors de la récupération des bénévoles: ${volunteersError.message}`);
    }

    // Fetch comments for all volunteers
    const { data: comments, error: commentsError } = await supabase
      .from('volunteer_comments')
      .select('*')
      .in('volunteer_token', volunteers.map(v => v.token));

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      throw new Error(`Erreur lors de la récupération des commentaires: ${commentsError.message}`);
    }

    // Group comments by volunteer token
    const commentsByToken = comments.reduce((acc, comment) => {
      if (!acc[comment.volunteer_token]) {
        acc[comment.volunteer_token] = [];
      }
      acc[comment.volunteer_token].push(comment);
      return acc;
    }, {} as Record<string, ApiComment[]>);

    return { volunteers, comments: commentsByToken };
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

  async addComment(token: string, content: string) {
    const { data, error } = await supabase
      .from('volunteer_comments')
      .insert([{ volunteer_token: token, content }])
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      throw new Error(`Erreur lors de l'ajout du commentaire: ${error.message}`);
    }

    return data;
  },

  async getByToken(token: string) {
    const { data: volunteer, error: volunteerError } = await supabase
      .from('volunteers')
      .select('*')
      .eq('token', token)
      .single();

    if (volunteerError) {
      console.error('Error fetching volunteer by token:', volunteerError);
      throw new Error(`Erreur lors de la récupération du bénévole: ${volunteerError.message}`);
    }

    const { data: comments, error: commentsError } = await supabase
      .from('volunteer_comments')
      .select('*')
      .eq('volunteer_token', token)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      throw new Error(`Erreur lors de la récupération des commentaires: ${commentsError.message}`);
    }

    return { volunteer, comments };
  },
};
