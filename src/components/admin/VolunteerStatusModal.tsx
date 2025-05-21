import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { pb } from '../../lib/pocketbase';

interface VolunteerStatusModalProps {
  eventId: string;
  volunteer: {
    token: string;
    userName: string;
    status: 'present' | 'absent' | 'undecided';
  };
  onClose: () => void;
  onUpdate: () => void;
}

export const VolunteerStatusModal: React.FC<VolunteerStatusModalProps> = ({
  eventId,
  volunteer,
  onClose,
  onUpdate,
}) => {
  const [status, setStatus] = useState<'present' | 'absent' | 'undecided'>(volunteer.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const event = await pb.collection('events').getOne(eventId);
      
      // Calculer le nombre actuel de participants avec le statut "present"
      const registrations = event.registrations || [];
      const presentCount = registrations.filter(reg => reg.status === 'present').length;
      
      // Vérifier si l'événement est complet avant de changer le statut à 'present'
      if (status === 'present' && volunteer.status !== 'present' && presentCount >= event.maxParticipants) {
        throw new Error('L\'événement est complet');
      }

      // Mettre à jour le statut de l'inscription
      const updatedRegistrations = registrations.map(reg => 
        reg.token === volunteer.token ? { ...reg, status } : reg
      );

      // Calculer le nouveau nombre de participants avec le statut "present"
      const newPresentCount = updatedRegistrations.filter(reg => reg.status === 'present').length;

      // Mettre à jour l'événement
      await pb.collection('events').update(eventId, {
        registrations: updatedRegistrations,
        currentParticipants: newPresentCount
      });

      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Une erreur est survenue lors de la mise à jour du statut"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Modifier le statut de {volunteer.userName}
        </h2>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut de présence
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'present' | 'absent' | 'undecided')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="present">Présent</option>
              <option value="absent">Absent</option>
              <option value="undecided">Indécis</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Mettre à jour"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
