import React, { useState } from 'react';
import { useVolunteerStore } from '../../store/volunteerStore';
import { VolunteerStatus } from '../../types/volunteer';
import { Loader2, X, Key } from 'lucide-react';
import { Input } from '../ui/Input';
import { ErrorMessage } from '../ui/ErrorMessage';

interface TokenManagementProps {
  onClose: () => void;
}

export const TokenManagement: React.FC<TokenManagementProps> = ({ onClose }) => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<VolunteerStatus>('present');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateVolunteerStatus = useVolunteerStore((state) => state.updateVolunteerStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Veuillez entrer votre token');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateVolunteerStatus(token.trim(), status);
      onClose();
    } catch (err) {
      console.error('Error updating volunteer status:', err);
      setError(
        'Token invalide. Veuillez vérifier que vous avez correctement copié le token qui vous a été fourni lors de votre inscription. Si le problème persiste, contactez l\'organisateur.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mettre à jour votre inscription</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Votre token"
            icon={Key}
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono"
            placeholder="Entrez votre token d'inscription"
            disabled={isSubmitting}
            helperText="Le token vous a été fourni lors de votre inscription"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau statut
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as VolunteerStatus)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <option value="present">Présent</option>
              <option value="absent">Absent</option>
              <option value="undecided">Indécis</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Mettre à jour'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
