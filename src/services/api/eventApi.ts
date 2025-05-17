import { pb } from '../../lib/pocketbase';

export const eventApi = {
  async getAll() {
    try {
      const records = await pb.collection('events').getList(1, 50, {
        sort: '+date',
      });
      return records.items;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error(`Erreur lors de la récupération des événements: ${error}`);
    }
  },

  async create(event: Omit<any, 'id' | 'created' | 'updated'>) {
    try {
      const record = await pb.collection('events').create(event);
      return record;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error(`Erreur lors de la création de l'événement: ${error}`);
    }
  },

  async update(id: string, updates: any) {
    try {
      const record = await pb.collection('events').update(id, updates);
      return record;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error(`Erreur lors de la mise à jour de l'événement: ${error}`);
    }
  },

  async delete(id: string) {
    try {
      await pb.collection('events').delete(id);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error(`Erreur lors de la suppression de l'événement: ${error}`);
    }
  },

  async updateParticipantCount(id: string, increment: boolean = true) {
    try {
      const record = await pb.collection('events').getOne(id);
      const newCount = increment 
        ? record.currentParticipants + 1 
        : Math.max(0, record.currentParticipants - 1);

      if (increment && newCount > record.maxParticipants) {
        throw new Error('Maximum number of participants reached');
      }

      await pb.collection('events').update(id, {
        currentParticipants: newCount
      });
    } catch (error) {
      console.error('Error updating participant count:', error);
      throw new Error(`Erreur lors de la mise à jour du nombre de participants: ${error}`);
    }
  },

  async toggleArchive(id: string, archived: boolean) {
    try {
      const record = await pb.collection('events').update(id, { archived });
      return record;
    } catch (error) {
      console.error('Error toggling archive status:', error);
      throw new Error(`Erreur lors de la modification du statut d'archive: ${error}`);
    }
  }
};