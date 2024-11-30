import React, { useState } from 'react';
import { useVolunteerStore } from '../../store/volunteerStore';
import { VolunteerStatus } from '../../types/volunteer';
import { Loader2, X } from 'lucide-react';

interface TokenUpdateFormProps {
  onClose: () => void;
}

export const TokenUpdateForm: React.FC<TokenUpdateFormProps> = ({ onClose }) => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<VolunteerStatus>('present');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateVolunteerStatus = useVolunteerStore((state) => state.updateVolunteerStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateVolunteerStatus(token, status);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de la mise à jour");
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

        <h2 className="text-xl font-semibold mb-4">Mettre à jour mon inscription</h2>

        {success ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">Votre statut a été mis à jour avec succès !</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token d'inscription
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez votre token"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VolunteerStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="present">Présent</option>
                <option value="absent">Absent</option>
                <option value="undecided">Indécis</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Mettre à jour'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};